package config

import (
	"os"
	"testing"
)

func TestLoad_ChatwootConfig(t *testing.T) {
	os.Setenv("CHATWOOT_BASE_URL", "https://chatwoot.example.com")
	os.Setenv("CHATWOOT_API_TOKEN", "test-token")
	os.Setenv("CHATWOOT_ACCOUNT_ID", "1")
	os.Setenv("CHATWOOT_WEBHOOK_SECRET", "webhook-secret")
	defer func() {
		os.Unsetenv("CHATWOOT_BASE_URL")
		os.Unsetenv("CHATWOOT_API_TOKEN")
		os.Unsetenv("CHATWOOT_ACCOUNT_ID")
		os.Unsetenv("CHATWOOT_WEBHOOK_SECRET")
	}()

	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.ChatwootBaseURL != "https://chatwoot.example.com" {
		t.Errorf("expected ChatwootBaseURL https://chatwoot.example.com, got %s", cfg.ChatwootBaseURL)
	}
	if cfg.ChatwootAPIToken != "test-token" {
		t.Errorf("expected ChatwootAPIToken test-token, got %s", cfg.ChatwootAPIToken)
	}
	if cfg.ChatwootAccountID != 1 {
		t.Errorf("expected ChatwootAccountID 1, got %d", cfg.ChatwootAccountID)
	}
	if cfg.ChatwootWebhookSecret != "webhook-secret" {
		t.Errorf("expected ChatwootWebhookSecret webhook-secret, got %s", cfg.ChatwootWebhookSecret)
	}
}
