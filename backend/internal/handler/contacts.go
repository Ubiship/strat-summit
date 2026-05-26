package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

// CreateContactRequest represents the request to create a contact
type CreateContactRequest struct {
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	Email       *string `json:"email,omitempty"`
	Phone       *string `json:"phone,omitempty"`
	CompanyName *string `json:"company_name,omitempty"`
	Role        string  `json:"role"`
	Notes       *string `json:"notes,omitempty"`
}

// ListContacts returns all contacts (admin only)
func (h *Handler) ListContacts(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	opts := parseListOptions(r)
	contacts, err := h.svc.ListContacts(r.Context(), opts)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list contacts", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, contacts)
}

// GetContact returns a single contact (admin only)
func (h *Handler) GetContact(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid contact id", "INVALID_ID")
		return
	}

	contact, err := h.svc.GetContact(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "contact not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get contact", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, contact)
}

// CreateContact creates a new contact (admin only)
func (h *Handler) CreateContact(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	var req CreateContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.FirstName == "" || req.LastName == "" || req.Role == "" {
		respondError(w, http.StatusBadRequest, "first_name, last_name, and role are required", "MISSING_FIELDS")
		return
	}

	contact := &domain.Contact{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		Phone:       req.Phone,
		CompanyName: req.CompanyName,
		Role:        domain.UserRole(req.Role),
		Notes:       req.Notes,
	}

	if err := h.svc.CreateContact(r.Context(), contact); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create contact", "CREATE_ERROR")
		return
	}

	respondJSON(w, http.StatusCreated, contact)
}
