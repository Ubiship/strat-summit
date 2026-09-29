package hostaway

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func TestVerifyWebhookSignature_Valid(t *testing.T) {
	client := New(Config{WebhookSecret: "test-secret"})
	body := []byte(`{"event":"reservation.created"}`)

	mac := hmac.New(sha256.New, []byte("test-secret"))
	mac.Write(body)
	signature := hex.EncodeToString(mac.Sum(nil))

	if !client.VerifySignature(body, signature) {
		t.Error("expected signature to be valid")
	}
}

func TestVerifyWebhookSignature_Invalid(t *testing.T) {
	client := New(Config{WebhookSecret: "test-secret"})
	body := []byte(`{"event":"reservation.created"}`)

	if client.VerifySignature(body, "invalid-signature") {
		t.Error("expected signature to be invalid")
	}
}

func TestVerifyWebhookSignature_WrongSecret(t *testing.T) {
	client := New(Config{WebhookSecret: "test-secret"})
	body := []byte(`{"event":"reservation.created"}`)

	// Create signature with different secret
	mac := hmac.New(sha256.New, []byte("wrong-secret"))
	mac.Write(body)
	signature := hex.EncodeToString(mac.Sum(nil))

	if client.VerifySignature(body, signature) {
		t.Error("expected signature with wrong secret to be invalid")
	}
}

func TestWebhookSecret(t *testing.T) {
	expectedSecret := "my-webhook-secret"
	client := New(Config{WebhookSecret: expectedSecret})

	if client.WebhookSecret() != expectedSecret {
		t.Errorf("expected webhook secret %s, got %s", expectedSecret, client.WebhookSecret())
	}
}
