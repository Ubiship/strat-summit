package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		ContactID string `json:"contact_id"`
	} `json:"user"`
}

// Login handles user authentication
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "email and password are required", "MISSING_CREDENTIALS")
		return
	}

	user, accessToken, refreshToken, err := h.svc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			respondError(w, http.StatusUnauthorized, "invalid email or password", "INVALID_CREDENTIALS")
			return
		}
		if errors.Is(err, service.ErrUserInactive) {
			respondError(w, http.StatusForbidden, "account is inactive", "ACCOUNT_INACTIVE")
			return
		}
		respondError(w, http.StatusInternalServerError, "authentication failed", "AUTH_ERROR")
		return
	}

	resp := LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}
	resp.User.ID = user.ID.String()
	resp.User.Email = user.Email
	resp.User.Role = string(user.Role)
	resp.User.ContactID = user.ContactID.String()

	respondJSON(w, http.StatusOK, resp)
}

// RefreshRequest represents the refresh token request body
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshResponse represents the refresh response
type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RefreshToken handles token refresh
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.RefreshToken == "" {
		respondError(w, http.StatusBadRequest, "refresh token is required", "MISSING_TOKEN")
		return
	}

	// Extract user ID from authorization header
	tokenString := r.Header.Get("Authorization")
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	if tokenString == "" {
		respondError(w, http.StatusUnauthorized, "authorization header required", "MISSING_TOKEN")
		return
	}

	// Parse token without expiry validation (token may be expired, that's expected)
	claims, err := auth.ParseTokenUnverified(tokenString, []byte(h.cfg.JWTSecret))
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid token", "INVALID_TOKEN")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid token", "INVALID_TOKEN")
		return
	}

	accessToken, refreshToken, err := h.svc.RefreshToken(r.Context(), userID, req.RefreshToken)
	if err != nil {
		if errors.Is(err, service.ErrInvalidRefresh) {
			respondError(w, http.StatusUnauthorized, "invalid refresh token", "INVALID_REFRESH_TOKEN")
			return
		}
		if errors.Is(err, service.ErrUserInactive) {
			respondError(w, http.StatusForbidden, "account is inactive", "ACCOUNT_INACTIVE")
			return
		}
		respondError(w, http.StatusInternalServerError, "refresh failed", "REFRESH_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	})
}

// Logout handles user logout
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	if err := h.svc.Logout(r.Context(), authCtx.UserID); err != nil {
		respondError(w, http.StatusInternalServerError, "logout failed", "LOGOUT_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"success": true})
}
