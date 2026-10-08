package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

// ListServiceRates returns all service rates
func (h *Handler) ListServiceRates(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	rates, err := h.repo.ListServiceRates(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list service rates", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, rates)
}

// GetServiceRate returns a single service rate by service type
func (h *Handler) GetServiceRate(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	serviceType := chi.URLParam(r, "service_type")
	if serviceType == "" {
		respondError(w, http.StatusBadRequest, "service_type is required", "MISSING_PARAM")
		return
	}

	rate, err := h.repo.GetServiceRate(r.Context(), serviceType)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "service rate not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get service rate", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, rate)
}

// UpdateServiceRateRequest represents the request to update a service rate
type UpdateServiceRateRequest struct {
	Rate          float64    `json:"rate"`
	MinCharge     *float64   `json:"min_charge,omitempty"`
	EffectiveDate *time.Time `json:"effective_date,omitempty"`
}

// UpdateServiceRate updates a service rate (admin only)
func (h *Handler) UpdateServiceRate(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Only admin can update rates
	if authCtx.Role != domain.RoleAdmin {
		respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	serviceType := chi.URLParam(r, "service_type")
	if serviceType == "" {
		respondError(w, http.StatusBadRequest, "service_type is required", "MISSING_PARAM")
		return
	}

	// Get existing rate
	existing, err := h.repo.GetServiceRate(r.Context(), serviceType)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "service rate not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get service rate", "GET_ERROR")
		return
	}

	var req UpdateServiceRateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Apply updates
	existing.Rate = req.Rate
	if req.MinCharge != nil {
		existing.MinCharge = req.MinCharge
	}
	if req.EffectiveDate != nil {
		existing.EffectiveDate = *req.EffectiveDate
	}

	if err := h.repo.UpdateServiceRate(r.Context(), existing); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update service rate", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, existing)
}
