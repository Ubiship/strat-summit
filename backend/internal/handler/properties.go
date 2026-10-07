package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

// CreatePropertyRequest represents the request to create a property
type CreatePropertyRequest struct {
	Name                      string      `json:"name"`
	Address                   string      `json:"address"`
	Tier                      string      `json:"tier"`
	CommissionRate            float64     `json:"commission_rate"`
	CleaningFee               float64     `json:"cleaning_fee"`
	CleaningFeeCommissionable bool        `json:"cleaning_fee_commissionable"`
	AirbnbIcalURL             *string     `json:"airbnb_ical_url,omitempty"`
	VRBOIcalURL               *string     `json:"vrbo_ical_url,omitempty"`
	WifiPassword              *string     `json:"wifi_password,omitempty"`
	AccessCodes               domain.JSONB `json:"access_codes,omitempty"`
	HotTub                    bool        `json:"hot_tub"`
	HotTubTempF               *int        `json:"hot_tub_temp_f,omitempty"`
	Notes                     *string     `json:"notes,omitempty"`
}

// ListProperties returns all properties the user has access to
func (h *Handler) ListProperties(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	opts := parseListOptions(r)
	properties, err := h.svc.ListProperties(r.Context(), authCtx.ToDomainAuthContext(), opts)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list properties", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, properties)
}

// GetProperty returns a single property
func (h *Handler) GetProperty(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	property, err := h.svc.GetProperty(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "property not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get property", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, property)
}

// CreateProperty creates a new property
func (h *Handler) CreateProperty(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	var req CreatePropertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Name == "" || req.Address == "" || req.Tier == "" {
		respondError(w, http.StatusBadRequest, "name, address, and tier are required", "MISSING_FIELDS")
		return
	}

	tier := domain.ServiceTier(req.Tier)
	if !tier.IsValid() {
		respondError(w, http.StatusBadRequest, "invalid tier value (must be 1, 2, or 3)", "INVALID_TIER")
		return
	}

	property := &domain.Property{
		Name:                      req.Name,
		Address:                   req.Address,
		Tier:                      tier,
		CommissionRate:            req.CommissionRate,
		CleaningFee:               req.CleaningFee,
		CleaningFeeCommissionable: req.CleaningFeeCommissionable,
		AirbnbIcalURL:             req.AirbnbIcalURL,
		VRBOIcalURL:               req.VRBOIcalURL,
		WifiPassword:              req.WifiPassword,
		AccessCodes:               req.AccessCodes,
		HotTub:                    req.HotTub,
		HotTubTempF:               req.HotTubTempF,
		Notes:                     req.Notes,
		Active:                    true,
	}

	if err := h.svc.CreateProperty(r.Context(), authCtx.ToDomainAuthContext(), property); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to create property", "CREATE_ERROR")
		return
	}

	respondJSON(w, http.StatusCreated, property)
}

// UpdateProperty updates an existing property
func (h *Handler) UpdateProperty(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	// Get existing property
	existing, err := h.svc.GetProperty(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "property not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get property", "GET_ERROR")
		return
	}

	// Decode update request
	var req CreatePropertyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Apply updates
	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Address != "" {
		existing.Address = req.Address
	}
	if req.Tier != "" {
		tier := domain.ServiceTier(req.Tier)
		if !tier.IsValid() {
			respondError(w, http.StatusBadRequest, "invalid tier value (must be 1, 2, or 3)", "INVALID_TIER")
			return
		}
		existing.Tier = tier
	}
	existing.CommissionRate = req.CommissionRate
	existing.CleaningFee = req.CleaningFee
	existing.CleaningFeeCommissionable = req.CleaningFeeCommissionable
	existing.AirbnbIcalURL = req.AirbnbIcalURL
	existing.VRBOIcalURL = req.VRBOIcalURL
	existing.WifiPassword = req.WifiPassword
	existing.AccessCodes = req.AccessCodes
	existing.HotTub = req.HotTub
	existing.HotTubTempF = req.HotTubTempF
	existing.Notes = req.Notes

	if err := h.svc.UpdateProperty(r.Context(), authCtx.ToDomainAuthContext(), existing); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update property", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, existing)
}

// UpdatePropertyCategoryRequest represents the request to update a property's category
type UpdatePropertyCategoryRequest struct {
	Category string `json:"category"`
}

// UpdatePropertyCategory updates only the category of a property
func (h *Handler) UpdatePropertyCategory(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Only admin can update category
	if authCtx.Role != domain.RoleAdmin {
		respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	var req UpdatePropertyCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validate category
	category := domain.PropertyCategory(req.Category)
	if category != domain.PropertyCategoryCondo &&
		category != domain.PropertyCategoryChalet &&
		category != domain.PropertyCategoryAlpineVillage {
		respondError(w, http.StatusBadRequest, "invalid category (must be condo, chalet, or alpine_village)", "INVALID_CATEGORY")
		return
	}

	if err := h.repo.UpdatePropertyCategory(r.Context(), id, category); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update property category", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "updated"})
}

// CompleteAssessmentRequest represents the request to complete a property assessment
type CompleteAssessmentRequest struct {
	AnnualRate *float64 `json:"annual_rate,omitempty"`
	SummerRate *float64 `json:"summer_rate,omitempty"`
	WinterRate *float64 `json:"winter_rate,omitempty"`
}

// CompletePropertyAssessment marks a property's assessment as complete and sets rates
func (h *Handler) CompletePropertyAssessment(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Only admin can complete assessments
	if authCtx.Role != domain.RoleAdmin {
		respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property id", "INVALID_ID")
		return
	}

	// Get the property to check its category
	property, err := h.svc.GetProperty(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "property not found", "NOT_FOUND")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get property", "GET_ERROR")
		return
	}

	var req CompleteAssessmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	// Validate rates based on category
	switch property.Category {
	case domain.PropertyCategoryCondo:
		if req.AnnualRate == nil {
			respondError(w, http.StatusBadRequest, "annual_rate is required for condo properties", "MISSING_RATE")
			return
		}
	case domain.PropertyCategoryChalet, domain.PropertyCategoryAlpineVillage:
		if req.SummerRate == nil || req.WinterRate == nil {
			respondError(w, http.StatusBadRequest, "summer_rate and winter_rate are required for chalet and alpine village properties", "MISSING_RATE")
			return
		}
	default:
		respondError(w, http.StatusBadRequest, "property category must be set before completing assessment", "MISSING_CATEGORY")
		return
	}

	if err := h.repo.CompletePropertyAssessment(r.Context(), id, req.AnnualRate, req.SummerRate, req.WinterRate); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to complete assessment", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "assessment complete"})
}
