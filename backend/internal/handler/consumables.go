package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// ListConsumables returns all consumables in the catalog
func (h *Handler) ListConsumables(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	consumables, err := h.repo.ListConsumables(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list consumables", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, consumables)
}

// ListStandardConsumables returns only standard consumables
func (h *Handler) ListStandardConsumables(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	consumables, err := h.repo.ListStandardConsumables(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to list standard consumables", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, consumables)
}

// GetPropertyConsumables returns consumables configured for a property
func (h *Handler) GetPropertyConsumables(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	propertyID, err := parseUUID(chi.URLParam(r, "property_id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property_id", "INVALID_ID")
		return
	}

	consumables, err := h.repo.GetPropertyConsumables(r.Context(), propertyID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get property consumables", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, consumables)
}

// SetPropertyConsumableRequest represents the request to set a property consumable
type SetPropertyConsumableRequest struct {
	ConsumableID string `json:"consumable_id"`
	Enabled      bool   `json:"enabled"`
	ParLevel     *int   `json:"par_level,omitempty"`
	Notes        string `json:"notes,omitempty"`
}

// SetPropertyConsumable configures a consumable for a property
func (h *Handler) SetPropertyConsumable(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Only admin can configure consumables
	if authCtx.Role != domain.RoleAdmin {
		respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	propertyID, err := parseUUID(chi.URLParam(r, "property_id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property_id", "INVALID_ID")
		return
	}

	var req SetPropertyConsumableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	consumableID, err := parseUUID(req.ConsumableID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid consumable_id", "INVALID_ID")
		return
	}

	var notes *string
	if req.Notes != "" {
		notes = &req.Notes
	}

	pc := &domain.PropertyConsumable{
		PropertyID:   propertyID,
		ConsumableID: consumableID,
		Enabled:      req.Enabled,
		ParLevel:     req.ParLevel,
		Notes:        notes,
	}

	if err := h.repo.SetPropertyConsumable(r.Context(), pc); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to set property consumable", "SET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, pc)
}

// GetJobConsumables returns consumables used in a job
func (h *Handler) GetJobConsumables(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	jobID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid job id", "INVALID_ID")
		return
	}

	consumables, err := h.repo.GetJobConsumables(r.Context(), jobID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get job consumables", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, consumables)
}
