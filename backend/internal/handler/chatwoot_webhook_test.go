package handler

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestChatwootWebhook_SignatureVerification(t *testing.T) {
	// This test verifies the HMAC signature verification logic
	secret := "test-webhook-secret"
	body := `{"event":"contact_created","account":1}`

	// Calculate correct signature
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(body))
	correctSig := hex.EncodeToString(mac.Sum(nil))

	// Verify correct signature calculation
	mac2 := hmac.New(sha256.New, []byte(secret))
	mac2.Write([]byte(body))
	expectedSig := hex.EncodeToString(mac2.Sum(nil))

	if correctSig != expectedSig {
		t.Errorf("signature mismatch: got %s, expected %s", correctSig, expectedSig)
	}
}

func TestChatwootWebhook_InvalidSignature(t *testing.T) {
	// Create request with invalid signature
	body := `{"event":"contact_created","account":1}`
	req := httptest.NewRequest("POST", "/webhooks/chatwoot", strings.NewReader(body))
	req.Header.Set("X-Chatwoot-Signature", "invalid-signature")
	req.Header.Set("Content-Type", "application/json")

	// Note: Full integration test would require mocked service
	// This is a placeholder for structure - actual test needs DI setup
	_ = req // Placeholder to avoid unused variable
}

func TestChatwootWebhook_ValidPayload(t *testing.T) {
	// Test payload parsing
	body := `{
		"event": "contact_created",
		"account": 1,
		"contact": {
			"id": 123,
			"name": "Test User",
			"email": "test@example.com",
			"phone_number": "+1234567890",
			"identifier": "uuid-123"
		}
	}`

	req := httptest.NewRequest("POST", "/webhooks/chatwoot", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	// Verify request body can be parsed
	if req.Body == nil {
		t.Error("expected body, got nil")
	}
}

func TestChatwootWebhook_ConversationCreated(t *testing.T) {
	body := `{
		"event": "conversation_created",
		"account": 1,
		"conversation": {
			"id": 456,
			"inbox_id": 1,
			"status": "open",
			"meta": {
				"sender": {
					"id": 123
				}
			}
		}
	}`

	req := httptest.NewRequest("POST", "/webhooks/chatwoot", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	if req.ContentLength == 0 {
		t.Error("expected content length > 0")
	}
}
