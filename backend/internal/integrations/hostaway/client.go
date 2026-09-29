package hostaway

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"
)

// Client is the Hostaway API client.
type Client struct {
	baseURL       string
	apiKey        string
	accountID     string
	webhookSecret string
	http          *http.Client
}

// New creates a new Hostaway API client with the provided configuration.
func New(cfg Config) *Client {
	return &Client{
		baseURL:       cfg.BaseURL,
		apiKey:        cfg.APIKey,
		accountID:     cfg.AccountID,
		webhookSecret: cfg.WebhookSecret,
		http: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// WebhookSecret returns the webhook secret for HMAC verification.
func (c *Client) WebhookSecret() string {
	return c.webhookSecret
}

// VerifySignature verifies that the webhook payload signature is valid.
// It uses HMAC-SHA256 to validate that the payload was sent by Hostaway.
func (c *Client) VerifySignature(body []byte, signature string) bool {
	mac := hmac.New(sha256.New, []byte(c.webhookSecret))
	mac.Write(body)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}
