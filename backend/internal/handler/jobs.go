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

// UpdateJobStatusRequest represents the request to update job status
type UpdateJobStatusRequest struct {
	Status string `json:"status"`
}

// AssignStaffRequest represents the request to assign staff to a job
type AssignStaffRequest struct {
	ContactID  string  `json:"contact_id"`
	HourlyRate float64 `json:"hourly_rate"`
}

// ListJobs returns cleaning jobs filtered by date
func (h *Handler) ListJobs(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	// Parse date filter (defaults to today)
	dateStr := r.URL.Query().Get("date")
	var date time.Time
	if dateStr != "" {
		var err error
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid date format (use YYYY-MM-DD)", "INVALID_DATE")
			return
		}
	} else {
		date = time.Now().Truncate(24 * time.Hour)
	}

	jobs, err := h.svc.ListCleaningJobsByDate(r.Context(), authCtx.ToDomainAuthContext(), date)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list jobs", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, jobs)
}

// GetJob returns a single cleaning job
func (h *Handler) GetJob(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid job id", "INVALID_ID")
		return
	}

	job, err := h.svc.GetCleaningJob(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "job not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get job", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, job)
}

// ClockInJob clocks in to a cleaning job
func (h *Handler) ClockInJob(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid job id", "INVALID_ID")
		return
	}

	if err := h.svc.ClockInJob(r.Context(), authCtx.ToDomainAuthContext(), id); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to clock in", "CLOCK_IN_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// ClockOutJob clocks out of a cleaning job
func (h *Handler) ClockOutJob(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid job id", "INVALID_ID")
		return
	}

	if err := h.svc.ClockOutJob(r.Context(), authCtx.ToDomainAuthContext(), id); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to clock out", "CLOCK_OUT_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// UpdateJobStatus updates the status of a cleaning job
func (h *Handler) UpdateJobStatus(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid job id", "INVALID_ID")
		return
	}

	var req UpdateJobStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Status == "" {
		respondError(w, http.StatusBadRequest, "status is required", "MISSING_STATUS")
		return
	}

	status := domain.JobStatus(req.Status)
	if !status.IsValid() {
		respondError(w, http.StatusBadRequest, "invalid status value (must be assigned, in_progress, complete, or flagged)", "INVALID_STATUS")
		return
	}

	if err := h.svc.UpdateJobStatus(r.Context(), authCtx.ToDomainAuthContext(), id, status); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to update status", "UPDATE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// AssignStaffToJob assigns a staff member to a cleaning job
func (h *Handler) AssignStaffToJob(w http.ResponseWriter, r *http.Request) {
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

	var req AssignStaffRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.ContactID == "" {
		respondError(w, http.StatusBadRequest, "contact_id is required", "MISSING_CONTACT_ID")
		return
	}

	contactID, err := uuid.Parse(req.ContactID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid contact_id", "INVALID_CONTACT_ID")
		return
	}

	if err := h.svc.AssignStaffToJob(r.Context(), authCtx.ToDomainAuthContext(), jobID, contactID, req.HourlyRate); err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to assign staff", "ASSIGN_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"success": true})
}
