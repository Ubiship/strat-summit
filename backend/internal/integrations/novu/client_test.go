package novu

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_UpsertSubscriber(t *testing.T) {
	var receivedBody map[string]interface{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/subscribers" {
			t.Errorf("expected path /v1/subscribers, got %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.Header.Get("Authorization") != "ApiKey test-key" {
			t.Errorf("expected Authorization header")
		}
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"data":{"subscriberId":"sub-123"}}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.UpsertSubscriber(context.Background(), Subscriber{
		SubscriberID: "sub-123",
		Email:        "test@example.com",
		Phone:        "+1234567890",
		FirstName:    "Test",
		LastName:     "User",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if receivedBody["subscriberId"] != "sub-123" {
		t.Errorf("expected subscriberId sub-123, got %v", receivedBody["subscriberId"])
	}
}

func TestClient_UpsertSubscriber_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"internal server error"}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.UpsertSubscriber(context.Background(), Subscriber{
		SubscriberID: "sub-123",
	})

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestClient_DeleteSubscriber(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/subscribers/sub-123" {
			t.Errorf("expected path /v1/subscribers/sub-123, got %s", r.URL.Path)
		}
		if r.Method != "DELETE" {
			t.Errorf("expected DELETE, got %s", r.Method)
		}
		if r.Header.Get("Authorization") != "ApiKey test-key" {
			t.Errorf("expected Authorization header")
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"data":{"acknowledged":true}}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.DeleteSubscriber(context.Background(), "sub-123")

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestClient_DeleteSubscriber_NotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error":"subscriber not found"}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.DeleteSubscriber(context.Background(), "nonexistent")

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestClient_BulkTrigger(t *testing.T) {
	var receivedBody map[string]interface{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/events/trigger/bulk" {
			t.Errorf("expected path /v1/events/trigger/bulk, got %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.Header.Get("Authorization") != "ApiKey test-key" {
			t.Errorf("expected Authorization header")
		}
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"data":{"acknowledged":true}}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.BulkTrigger(context.Background(), "booking-confirmed", []string{"sub-1", "sub-2", "sub-3"}, map[string]interface{}{
		"bookingId": "booking-123",
		"date":      "2024-01-15",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if receivedBody["name"] != "booking-confirmed" {
		t.Errorf("expected name booking-confirmed, got %v", receivedBody["name"])
	}
	events, ok := receivedBody["events"].([]interface{})
	if !ok {
		t.Fatalf("expected events array, got %T", receivedBody["events"])
	}
	if len(events) != 3 {
		t.Errorf("expected 3 events, got %d", len(events))
	}
}

func TestClient_BulkTrigger_EmptySubscribers(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("server should not be called for empty subscribers")
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.BulkTrigger(context.Background(), "event", []string{}, nil)

	if err != nil {
		t.Fatalf("unexpected error for empty subscribers: %v", err)
	}
}

func TestClient_Trigger(t *testing.T) {
	var receivedBody map[string]interface{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/events/trigger" {
			t.Errorf("expected path /v1/events/trigger, got %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if r.Header.Get("Authorization") != "ApiKey test-key" {
			t.Errorf("expected Authorization header")
		}
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("expected Content-Type application/json")
		}
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"data":{"acknowledged":true}}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.Trigger(context.Background(), "booking-confirmed", "sub-123", map[string]interface{}{
		"bookingId": "booking-456",
		"property":  "Beach House",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if receivedBody["name"] != "booking-confirmed" {
		t.Errorf("expected name booking-confirmed, got %v", receivedBody["name"])
	}
	to, ok := receivedBody["to"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected to object, got %T", receivedBody["to"])
	}
	if to["subscriberId"] != "sub-123" {
		t.Errorf("expected subscriberId sub-123, got %v", to["subscriberId"])
	}
}

func TestClient_Trigger_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"invalid event"}`))
	}))
	defer server.Close()

	client := New(Config{APIKey: "test-key", BaseURL: server.URL})

	err := client.Trigger(context.Background(), "invalid-event", "sub-123", nil)

	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
