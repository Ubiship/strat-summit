package chatwoot

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCreateContact(t *testing.T) {
	expectedContact := Contact{
		Name:       "John Doe",
		Email:      "john@example.com",
		Phone:      "+1234567890",
		ExternalID: "user-123",
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/contacts"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Verify Content-Type
		contentType := r.Header.Get("Content-Type")
		if contentType != "application/json" {
			t.Errorf("expected Content-Type 'application/json', got '%s'", contentType)
		}

		// Verify request body
		var reqBody Contact
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatalf("failed to decode request body: %v", err)
		}
		if reqBody.Name != expectedContact.Name {
			t.Errorf("expected name %s, got %s", expectedContact.Name, reqBody.Name)
		}

		// Send response
		response := contactResponse{
			Payload: Contact{
				ID:         456,
				Name:       expectedContact.Name,
				Email:      expectedContact.Email,
				Phone:      expectedContact.Phone,
				ExternalID: expectedContact.ExternalID,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.CreateContact(context.Background(), expectedContact)
	if err != nil {
		t.Fatalf("CreateContact failed: %v", err)
	}

	if result.ID != 456 {
		t.Errorf("expected ID 456, got %d", result.ID)
	}
	if result.Name != expectedContact.Name {
		t.Errorf("expected name %s, got %s", expectedContact.Name, result.Name)
	}
}

func TestGetContactByPhone(t *testing.T) {
	phoneNumber := "+1234567890"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/contacts/filter"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Verify filter payload
		var reqBody map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatalf("failed to decode request body: %v", err)
		}

		payload, ok := reqBody["payload"].([]interface{})
		if !ok || len(payload) == 0 {
			t.Fatal("expected payload array in request")
		}

		filter := payload[0].(map[string]interface{})
		if filter["attribute_key"] != "phone_number" {
			t.Errorf("expected attribute_key 'phone_number', got %v", filter["attribute_key"])
		}
		if filter["filter_operator"] != "equal_to" {
			t.Errorf("expected filter_operator 'equal_to', got %v", filter["filter_operator"])
		}

		// Send response
		response := contactsSearchResponse{
			Payload: []Contact{
				{
					ID:    789,
					Name:  "Found User",
					Phone: phoneNumber,
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.GetContactByPhone(context.Background(), phoneNumber)
	if err != nil {
		t.Fatalf("GetContactByPhone failed: %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}
	if result.ID != 789 {
		t.Errorf("expected ID 789, got %d", result.ID)
	}
	if result.Phone != phoneNumber {
		t.Errorf("expected phone %s, got %s", phoneNumber, result.Phone)
	}
}

func TestGetContactByPhone_NotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Send empty response
		response := contactsSearchResponse{
			Payload: []Contact{},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.GetContactByPhone(context.Background(), "+9999999999")
	if err != nil {
		t.Fatalf("GetContactByPhone failed: %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result for not found, got %v", result)
	}
}

func TestUpsertContact(t *testing.T) {
	contact := Contact{
		Name:       "Jane Doe",
		Email:      "jane@example.com",
		Phone:      "+0987654321",
		ExternalID: "user-456",
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/contacts"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify identifier in request body
		var reqBody Contact
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatalf("failed to decode request body: %v", err)
		}
		if reqBody.ExternalID != contact.ExternalID {
			t.Errorf("expected identifier %s, got %s", contact.ExternalID, reqBody.ExternalID)
		}

		// Send response
		response := contactResponse{
			Payload: Contact{
				ID:         999,
				Name:       contact.Name,
				Email:      contact.Email,
				Phone:      contact.Phone,
				ExternalID: contact.ExternalID,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.UpsertContact(context.Background(), contact)
	if err != nil {
		t.Fatalf("UpsertContact failed: %v", err)
	}

	if result.ID != 999 {
		t.Errorf("expected ID 999, got %d", result.ID)
	}
	if result.ExternalID != contact.ExternalID {
		t.Errorf("expected ExternalID %s, got %s", contact.ExternalID, result.ExternalID)
	}
}

func TestSendMessage(t *testing.T) {
	conversationID := int64(123)
	message := Message{
		Content:     "Hello, this is a test message",
		MessageType: "outgoing",
		Private:     false,
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/conversations/123/messages"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Verify message content in request body
		var reqBody Message
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatalf("failed to decode request body: %v", err)
		}
		if reqBody.Content != message.Content {
			t.Errorf("expected content %s, got %s", message.Content, reqBody.Content)
		}
		if reqBody.MessageType != message.MessageType {
			t.Errorf("expected message_type %s, got %s", message.MessageType, reqBody.MessageType)
		}

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	err := client.SendMessage(context.Background(), conversationID, message)
	if err != nil {
		t.Fatalf("SendMessage failed: %v", err)
	}
}

func TestCreateConversation(t *testing.T) {
	contactID := int64(456)
	inboxID := 789

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/conversations"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify request body
		body, _ := io.ReadAll(r.Body)
		var reqBody map[string]interface{}
		json.Unmarshal(body, &reqBody)

		if int64(reqBody["contact_id"].(float64)) != contactID {
			t.Errorf("expected contact_id %d, got %v", contactID, reqBody["contact_id"])
		}
		if int(reqBody["inbox_id"].(float64)) != inboxID {
			t.Errorf("expected inbox_id %d, got %v", inboxID, reqBody["inbox_id"])
		}

		// Send response with InboxID
		response := conversationResponse{
			ID:        111,
			InboxID:   inboxID,
			ContactID: contactID,
			Status:    "open",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.CreateConversation(context.Background(), contactID, inboxID)
	if err != nil {
		t.Fatalf("CreateConversation failed: %v", err)
	}

	if result.ID != 111 {
		t.Errorf("expected ID 111, got %d", result.ID)
	}
	if result.InboxID != inboxID {
		t.Errorf("expected InboxID %d, got %d", inboxID, result.InboxID)
	}
	if result.ContactID != contactID {
		t.Errorf("expected ContactID %d, got %d", contactID, result.ContactID)
	}
}

func TestResolveConversation(t *testing.T) {
	conversationID := int64(999)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/conversations/999/toggle_status"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Verify status in request body
		body, _ := io.ReadAll(r.Body)
		if !strings.Contains(string(body), "resolved") {
			t.Errorf("expected 'resolved' in request body, got %s", string(body))
		}

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	err := client.ResolveConversation(context.Background(), conversationID)
	if err != nil {
		t.Fatalf("ResolveConversation failed: %v", err)
	}
}

func TestError_Response(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "internal server error"}`))
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	// Test error on CreateContact
	_, err := client.CreateContact(context.Background(), Contact{Name: "Test"})
	if err == nil {
		t.Error("expected error on 500 response, got nil")
	}
	if !strings.Contains(err.Error(), "500") {
		t.Errorf("expected error to mention status 500, got: %v", err)
	}
}

func TestUpdateContact(t *testing.T) {
	contactID := int64(456)
	contact := Contact{
		ID:         contactID,
		Name:       "Updated Name",
		Email:      "updated@example.com",
		Phone:      "+1111111111",
		ExternalID: "user-123",
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "PUT" {
			t.Errorf("expected PUT, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/contacts/456"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Verify request body
		var reqBody Contact
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			t.Fatalf("failed to decode request body: %v", err)
		}
		if reqBody.Name != contact.Name {
			t.Errorf("expected name %s, got %s", contact.Name, reqBody.Name)
		}

		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	err := client.UpdateContact(context.Background(), contactID, contact)
	if err != nil {
		t.Fatalf("UpdateContact failed: %v", err)
	}
}

func TestUpdateContact_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	err := client.UpdateContact(context.Background(), 999, Contact{Name: "Test"})
	if err == nil {
		t.Error("expected error on 404 response, got nil")
	}
}

func TestGetContact(t *testing.T) {
	contactID := int64(789)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify method
		if r.Method != "GET" {
			t.Errorf("expected GET, got %s", r.Method)
		}

		// Verify path
		expectedPath := "/api/v1/accounts/123/contacts/789"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path %s, got %s", expectedPath, r.URL.Path)
		}

		// Verify auth header
		authHeader := r.Header.Get("api_access_token")
		if authHeader != "test-token" {
			t.Errorf("expected auth token 'test-token', got '%s'", authHeader)
		}

		// Send response
		response := contactResponse{
			Payload: Contact{
				ID:         contactID,
				Name:       "Found Contact",
				Email:      "found@example.com",
				Phone:      "+1234567890",
				ExternalID: "user-789",
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	result, err := client.GetContact(context.Background(), contactID)
	if err != nil {
		t.Fatalf("GetContact failed: %v", err)
	}

	if result.ID != contactID {
		t.Errorf("expected ID %d, got %d", contactID, result.ID)
	}
	if result.Name != "Found Contact" {
		t.Errorf("expected name 'Found Contact', got %s", result.Name)
	}
}

func TestGetContact_NotFound(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := &Client{
		baseURL:   server.URL,
		apiToken:  "test-token",
		accountID: 123,
		http:      server.Client(),
	}

	_, err := client.GetContact(context.Background(), 999)
	if err == nil {
		t.Error("expected error on 404 response, got nil")
	}
}
