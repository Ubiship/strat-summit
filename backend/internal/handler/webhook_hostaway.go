package handler

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/ubiship/strat-summit/backend/internal/integrations/hostaway"
)

// HostawayWebhookPayload represents the incoming webhook from Hostaway.
type HostawayWebhookPayload struct {
	Event string                `json:"event"`
	Data  *hostaway.Reservation `json:"data,omitempty"`
}

// HostawayWebhook handles incoming webhooks from Hostaway.
func (h *Handler) HostawayWebhook(w http.ResponseWriter, r *http.Request) {
	// Read body for signature verification
	body, err := io.ReadAll(r.Body)
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to read body", "BAD_REQUEST")
		return
	}

	// Verify HMAC signature
	signature := r.Header.Get("X-Hostaway-Signature")
	if !h.verifyHostawaySignature(body, signature) {
		respondError(w, http.StatusUnauthorized, "invalid signature", "UNAUTHORIZED")
		return
	}

	// Decode payload
	var payload HostawayWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload", "BAD_REQUEST")
		return
	}

	// Route by event type
	ctx := r.Context()
	switch payload.Event {
	case "reservation.created":
		if payload.Data != nil {
			_ = h.svc.HandleHostawayReservationCreated(ctx, payload.Data)
		}

	case "reservation.updated":
		if payload.Data != nil {
			_ = h.svc.HandleHostawayReservationUpdated(ctx, payload.Data)
		}

	case "reservation.cancelled":
		if payload.Data != nil {
			_ = h.svc.HandleHostawayReservationCancelled(ctx, payload.Data)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) verifyHostawaySignature(body []byte, signature string) bool {
	hostawayClient := h.svc.Hostaway()
	if hostawayClient == nil {
		return false
	}

	secret := hostawayClient.WebhookSecret()
	if secret == "" {
		// No secret configured - skip verification in dev
		return true
	}

	return hostawayClient.VerifySignature(body, signature)
}
