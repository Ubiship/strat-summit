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

// ListPendingContacts returns pending contacts awaiting admin review.
func (h *Handler) ListPendingContacts(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	opts := parseListOptions(r)
	contacts, err := h.svc.ListPendingContacts(r.Context(), authCtx.ToDomainAuthContext(), opts)
	if err != nil {
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to list pending contacts", "LIST_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, contacts)
}

// GetPendingContact returns a single pending contact.
func (h *Handler) GetPendingContact(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id", "INVALID_ID")
		return
	}

	contact, err := h.svc.GetPendingContact(r.Context(), authCtx.ToDomainAuthContext(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "pending contact not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to get pending contact", "GET_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, contact)
}

// ApprovePendingContactRequest represents the request to approve a pending contact.
type ApprovePendingContactRequest struct {
	TargetContactID string `json:"target_contact_id"`
}

// ApprovePendingContact links a pending contact to an existing contact.
func (h *Handler) ApprovePendingContact(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	pendingID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id", "INVALID_ID")
		return
	}

	var req ApprovePendingContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	targetID, err := parseUUID(req.TargetContactID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid target_contact_id", "INVALID_ID")
		return
	}

	if err := h.svc.ApprovePendingContact(r.Context(), authCtx.ToDomainAuthContext(), pendingID, targetID); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "pending contact not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to approve pending contact", "APPROVE_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "approved"})
}

// CreateContactFromPendingRequest represents the request to create a contact from pending.
type CreateContactFromPendingRequest struct {
	Role string `json:"role"`
}

// CreateContactFromPending creates a new contact from a pending contact.
func (h *Handler) CreateContactFromPending(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	pendingID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id", "INVALID_ID")
		return
	}

	var req CreateContactFromPendingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Role == "" {
		respondError(w, http.StatusBadRequest, "role is required", "MISSING_FIELD")
		return
	}

	contact, err := h.svc.CreateContactFromPending(r.Context(), authCtx.ToDomainAuthContext(), pendingID, domain.UserRole(req.Role))
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "pending contact not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to create contact", "CREATE_ERROR")
		return
	}

	respondJSON(w, http.StatusCreated, contact)
}

// RejectPendingContactRequest represents the request to reject a pending contact.
type RejectPendingContactRequest struct {
	Reason string `json:"reason,omitempty"`
}

// RejectPendingContact marks a pending contact as rejected.
func (h *Handler) RejectPendingContact(w http.ResponseWriter, r *http.Request) {
	authCtx := auth.AuthFromContext(r.Context())
	if authCtx == nil {
		respondError(w, http.StatusUnauthorized, "unauthorized", "UNAUTHORIZED")
		return
	}

	pendingID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid id", "INVALID_ID")
		return
	}

	var req RejectPendingContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// Allow empty body for rejection
		req.Reason = ""
	}

	if err := h.svc.RejectPendingContact(r.Context(), authCtx.ToDomainAuthContext(), pendingID, req.Reason); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			respondError(w, http.StatusNotFound, "pending contact not found", "NOT_FOUND")
			return
		}
		if errors.Is(err, service.ErrForbidden) {
			respondError(w, http.StatusForbidden, "access denied", "FORBIDDEN")
			return
		}
		respondError(w, http.StatusInternalServerError, "failed to reject pending contact", "REJECT_ERROR")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"status": "rejected"})
}
