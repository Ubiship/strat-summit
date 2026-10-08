package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

// ListPropertyLinens returns all linens configured for a property
func (h *Handler) ListPropertyLinens(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	propertyID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	linens, err := h.svc.GetPropertyLinens(r.Context(), authCtx.ToDomainAuthContext(), propertyID)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list linens", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, linens)
}

// CreatePropertyLinenRequest represents the request to create a property linen
type CreatePropertyLinenRequest struct {
	LinenType              string     `json:"linen_type"`
	BedSize                *string    `json:"bed_size,omitempty"`
	Location               *string    `json:"location,omitempty"`
	Quantity               int        `json:"quantity"`
	RequiredSets           int        `json:"required_sets"`
	Condition              string     `json:"condition"`
	LastDeepClean          *time.Time `json:"last_deep_clean,omitempty"`
	TurnoversSinceLaunder  int        `json:"turnovers_since_launder"`
	Notes                  *string    `json:"notes,omitempty"`
}

// CreatePropertyLinen creates a new linen record for a property
func (h *Handler) CreatePropertyLinen(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	propertyID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	var req CreatePropertyLinenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validate required fields
	if req.LinenType == "" {
		respondError(w, http.StatusBadRequest, "linen_type is required", "MISSING_FIELD")
		return
	}

	// Convert bed_size to domain type if provided
	var bedSize *domain.BedSize
	if req.BedSize != nil {
		bs := domain.BedSize(*req.BedSize)
		bedSize = &bs
	}

	linen := &domain.PropertyLinen{
		PropertyID:            propertyID,
		LinenType:             domain.LinenType(req.LinenType),
		BedSize:               bedSize,
		Location:              req.Location,
		Quantity:              req.Quantity,
		RequiredSets:          req.RequiredSets,
		Condition:             req.Condition,
		LastDeepClean:         req.LastDeepClean,
		TurnoversSinceLaunder: req.TurnoversSinceLaunder,
		Notes:                 req.Notes,
	}

	if err := h.svc.CreatePropertyLinen(r.Context(), authCtx.ToDomainAuthContext(), linen); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to create linen", "CREATE_ERROR")
		return
	}

	respondJSON(w, http.StatusCreated, linen)
}

// UpdatePropertyLinen updates an existing linen record
func (h *Handler) UpdatePropertyLinen(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	linenID, err := parseUUID(chi.URLParam(r, "linen_id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid linen id", "INVALID_ID")
		return
	}

	// Get existing linen
	existing, err := h.repo.GetPropertyLinenByID(r.Context(), linenID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "linen not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get linen", "GET_ERROR")
		return
	}

	var req CreatePropertyLinenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Apply updates
	if req.LinenType != "" {
		existing.LinenType = domain.LinenType(req.LinenType)
	}
	if req.BedSize != nil {
		bs := domain.BedSize(*req.BedSize)
		existing.BedSize = &bs
	}
	existing.Location = req.Location
	existing.Quantity = req.Quantity
	existing.RequiredSets = req.RequiredSets
	if req.Condition != "" {
		existing.Condition = req.Condition
	}
	existing.LastDeepClean = req.LastDeepClean
	existing.TurnoversSinceLaunder = req.TurnoversSinceLaunder
	existing.Notes = req.Notes

	if err := h.svc.UpdatePropertyLinen(r.Context(), authCtx.ToDomainAuthContext(), existing); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update linen", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, existing)
}

// DeletePropertyLinen removes a linen record
func (h *Handler) DeletePropertyLinen(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	linenID, err := parseUUID(chi.URLParam(r, "linen_id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid linen id", "INVALID_ID")
		return
	}

	if err := h.svc.DeletePropertyLinen(r.Context(), authCtx.ToDomainAuthContext(), linenID); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to delete linen", "DELETE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// GetPropertyLinenAlerts returns duvet rotation alerts for a property
func (h *Handler) GetPropertyLinenAlerts(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	propertyID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	alerts, err := h.svc.CheckDuvetRotation(r.Context(), propertyID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to get linen alerts", "ALERT_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, alerts)
}

// RecordLinenLaunderRequest represents the request to record a linen launder
type RecordLinenLaunderRequest struct {
	JobID *uuid.UUID `json:"job_id,omitempty"`
}

// RecordLinenLaunder marks a linen as laundered
func (h *Handler) RecordLinenLaunder(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Only admin can record linen laundering
	if authCtx.Role != domain.RoleAdmin {
		respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	linenID, err := parseUUID(chi.URLParam(r, "linen_id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid linen id", "INVALID_ID")
		return
	}

	var req RecordLinenLaunderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Body is optional
		req = RecordLinenLaunderRequest{}
	}

	if err := h.svc.RecordLinenLaunder(r.Context(), linenID, req.JobID); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to record launder", "LAUNDER_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "laundered"})
}
