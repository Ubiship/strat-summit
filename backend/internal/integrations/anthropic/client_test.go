package anthropic

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNew(t *testing.T) {
	client := New(Config{
		APIKey: "test-key",
		Model:  "claude-sonnet-4-20250514",
	})

	if client == nil {
		t.Fatal("expected non-nil client")
	}
	if client.apiKey != "test-key" {
		t.Errorf("expected apiKey 'test-key', got '%s'", client.apiKey)
	}
	if client.model != "claude-sonnet-4-20250514" {
		t.Errorf("expected model 'claude-sonnet-4-20250514', got '%s'", client.model)
	}
}

func TestGenerateResponse_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request
		if r.Header.Get("x-api-key") != "test-key" {
			t.Errorf("expected x-api-key header 'test-key'")
		}
		if r.Header.Get("anthropic-version") != apiVersion {
			t.Errorf("expected anthropic-version header '%s'", apiVersion)
		}

		// Return mock response
		resp := messageResponse{
			ID:   "msg_123",
			Type: "message",
			Role: "assistant",
			Content: []contentBlock{
				{Type: "text", Text: "Hello! How can I help you today?"},
			},
			Model:      "claude-sonnet-4-20250514",
			StopReason: "end_turn",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:  "test-key",
		model:   "claude-sonnet-4-20250514",
		baseURL: server.URL,
		http:    server.Client(),
	}

	messages := []Message{
		{Role: "user", Content: "Hello"},
	}

	result, err := client.GenerateResponse(context.Background(), "You are a helpful assistant.", messages)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "Hello! How can I help you today?"
	if result != expected {
		t.Errorf("expected '%s', got '%s'", expected, result)
	}
}

func TestGenerateResponse_APIError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		resp := errorResponse{
			Type: "error",
			Error: struct {
				Type    string `json:"type"`
				Message string `json:"message"`
			}{
				Type:    "invalid_request_error",
				Message: "Invalid API key",
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	client := &Client{
		apiKey:  "invalid-key",
		model:   "claude-sonnet-4-20250514",
		baseURL: server.URL,
		http:    server.Client(),
	}

	messages := []Message{
		{Role: "user", Content: "Hello"},
	}

	_, err := client.GenerateResponse(context.Background(), "You are a helpful assistant.", messages)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
