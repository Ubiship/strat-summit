package handler

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/chatwoot"
)

// ChatwootWebhookPayload represents the incoming webhook from Chatwoot.
type ChatwootWebhookPayload struct {
	Event        string                  `json:"event"`
	AccountID    int                     `json:"account"`
	Conversation *ChatwootConversation   `json:"conversation,omitempty"`
	Contact      *ChatwootWebhookContact `json:"contact,omitempty"`
	Message      *ChatwootMessage        `json:"message,omitempty"`
}

type ChatwootConversation struct {
	ID        int64  `json:"id"`
	InboxID   int    `json:"inbox_id"`
	ContactID int64  `json:"contact_id"`
	Status    string `json:"status"`
	Meta      struct {
		Sender struct {
			ID int64 `json:"id"`
		} `json:"sender"`
	} `json:"meta"`
}

type ChatwootWebhookContact struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
	Identifier  string `json:"identifier"`
}

type ChatwootMessage struct {
	ID          int64  `json:"id"`
	Content     string `json:"content"`
	MessageType string `json:"message_type"`
	Private     bool   `json:"private"`
}

// ChatwootWebhook handles incoming webhooks from Chatwoot.
func (h *Handler) ChatwootWebhook(w http.ResponseWriter, r *http.Request) {
	// Read body for signature verification
	body, err := io.ReadAll(r.Body)
	if err != nil {
		respondError(w, http.StatusBadRequest, "failed to read body", "BAD_REQUEST")
		return
	}

	// Verify HMAC signature
	signature := r.Header.Get("X-Chatwoot-Signature")
	if !h.verifyChatwootSignature(body, signature) {
		respondError(w, http.StatusUnauthorized, "invalid signature", "UNAUTHORIZED")
		return
	}

	// Decode payload
	var payload ChatwootWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload", "BAD_REQUEST")
		return
	}

	// Log event asynchronously (fire and forget)
	go h.logChatwootEvent(r.Context(), payload, body)

	// Route by event type
	ctx := r.Context()
	switch payload.Event {
	case "contact_created":
		if payload.Contact != nil {
			cwContact := &chatwoot.Contact{
				ID:         payload.Contact.ID,
				Name:       payload.Contact.Name,
				Email:      payload.Contact.Email,
				Phone:      payload.Contact.PhoneNumber,
				ExternalID: payload.Contact.Identifier,
			}
			_ = h.svc.HandleContactCreatedFromChatwoot(ctx, cwContact)
		}

	case "conversation_created":
		if payload.Conversation != nil {
			conv := &chatwoot.Conversation{
				ID:        payload.Conversation.ID,
				InboxID:   payload.Conversation.InboxID,
				ContactID: payload.Conversation.Meta.Sender.ID,
				Status:    payload.Conversation.Status,
			}
			_ = h.svc.HandleConversationCreated(ctx, conv)
		}

	case "message_created":
		// Log only - no processing needed
		// Already logged asynchronously above

	case "conversation_resolved":
		// Log only - no automatic status changes
		// Already logged asynchronously above
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) verifyChatwootSignature(body []byte, signature string) bool {
	if h.svc.Chatwoot() == nil {
		return false
	}

	secret := h.svc.Chatwoot().WebhookSecret()
	if secret == "" {
		// No secret configured - skip verification in dev
		return true
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expectedSig))
}

func (h *Handler) logChatwootEvent(ctx context.Context, payload ChatwootWebhookPayload, rawBody []byte) {
	event := &domain.ChatwootEvent{
		ChatwootEventType: payload.Event,
		Payload:           domain.JSONB{},
	}

	// Parse raw body into JSONB
	json.Unmarshal(rawBody, &event.Payload)

	if payload.Conversation != nil {
		event.ChatwootConversationID = &payload.Conversation.ID
	}
	if payload.Contact != nil {
		event.ChatwootContactID = &payload.Contact.ID
	}

	// Note: Using background context since this is fire-and-forget
	_ = h.svc.LogChatwootEvent(ctx, event)
}
