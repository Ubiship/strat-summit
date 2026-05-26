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

// CreateBookingRequest represents the request to create a booking
type CreateBookingRequest struct {
	PropertyID             string   `json:"property_id"`
	Source                 string   `json:"source"`
	GuestName              *string  `json:"guest_name,omitempty"`
	GuestEmail             *string  `json:"guest_email,omitempty"`
	GuestPhone             *string  `json:"guest_phone,omitempty"`
	CheckIn                string   `json:"check_in"`
	CheckOut               string   `json:"check_out"`
	NightlyRate            *float64 `json:"nightly_rate,omitempty"`
	RevenueInclCleaningFee *float64 `json:"revenue_incl_cleaning_fee,omitempty"`
	RevenueExclCleaningFee *float64 `json:"revenue_excl_cleaning_fee,omitempty"`
	CleaningFeeCharged     *float64 `json:"cleaning_fee_charged,omitempty"`
	Notes                  *string  `json:"notes,omitempty"`
}

// ListBookings returns bookings filtered by property
func (h *Handler) ListBookings(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	propertyIDStr := r.URL.Query().Get("property_id")
	if propertyIDStr == "" {
		respondError(w, http.StatusBadRequest, "property_id query parameter is required", "MISSING_PROPERTY_ID")
		return
	}

	propertyID, err := uuid.Parse(propertyIDStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property_id", "INVALID_PROPERTY_ID")
		return
	}

	opts := parseListOptions(r)
	bookings, err := h.svc.ListBookingsByProperty(r.Context(), authCtx.ToDomainAuthContext(), propertyID, opts)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list bookings", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, bookings)
}

// GetBooking returns a single booking
func (h *Handler) GetBooking(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid booking id", "INVALID_ID")
		return
	}

	booking, err := h.svc.GetBooking(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "booking not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get booking", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, booking)
}

// CreateBooking creates a new booking
func (h *Handler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.PropertyID == "" || req.Source == "" || req.CheckIn == "" || req.CheckOut == "" {
		respondError(w, http.StatusBadRequest, "property_id, source, check_in, and check_out are required", "MISSING_FIELDS")
		return
	}

	propertyID, err := uuid.Parse(req.PropertyID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid property_id", "INVALID_PROPERTY_ID")
		return
	}

	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid check_in date format (use YYYY-MM-DD)", "INVALID_DATE")
		return
	}

	checkOut, err := time.Parse("2006-01-02", req.CheckOut)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid check_out date format (use YYYY-MM-DD)", "INVALID_DATE")
		return
	}

	if checkOut.Before(checkIn) || checkOut.Equal(checkIn) {
		respondError(w, http.StatusBadRequest, "check_out must be after check_in", "INVALID_DATES")
		return
	}

	source := domain.BookingSource(req.Source)
	if !source.IsValid() {
		respondError(w, http.StatusBadRequest, "invalid source value (must be airbnb, vrbo, direct, owner_use, or platform)", "INVALID_SOURCE")
		return
	}

	booking := &domain.Booking{
		PropertyID:             propertyID,
		Source:                 source,
		GuestName:              req.GuestName,
		GuestEmail:             req.GuestEmail,
		GuestPhone:             req.GuestPhone,
		CheckIn:                checkIn,
		CheckOut:               checkOut,
		NightlyRate:            req.NightlyRate,
		RevenueInclCleaningFee: req.RevenueInclCleaningFee,
		RevenueExclCleaningFee: req.RevenueExclCleaningFee,
		CleaningFeeCharged:     req.CleaningFeeCharged,
		Notes:                  req.Notes,
	}

	if err := h.svc.CreateBooking(r.Context(), authCtx.ToDomainAuthContext(), booking); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to create booking", "CREATE_ERROR")
		return
	}

	respondJSON(w, http.StatusCreated, booking)
}
