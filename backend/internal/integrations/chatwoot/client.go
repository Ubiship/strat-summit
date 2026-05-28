package chatwoot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	baseURL       string
	apiToken      string
	accountID     int
	webhookSecret string
	http          *http.Client
}

type Config struct {
	BaseURL       string
	APIToken      string
	AccountID     int
	WebhookSecret string
}

func New(cfg Config) *Client {
	return &Client{
		baseURL:       cfg.BaseURL,
		apiToken:      cfg.APIToken,
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

type Contact struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Email      string `json:"email,omitempty"`
	Phone      string `json:"phone_number,omitempty"`
	ExternalID string `json:"identifier,omitempty"`
}

type Conversation struct {
	ID        int64  `json:"id"`
	InboxID   int    `json:"inbox_id"`
	ContactID int64  `json:"contact_id"`
	Status    string `json:"status"`
}

type Message struct {
	Content     string `json:"content"`
	MessageType string `json:"message_type"`
	Private     bool   `json:"private"`
}

// contactResponse wraps the API response for contact operations.
type contactResponse struct {
	Payload Contact `json:"payload"`
}

// contactsSearchResponse wraps the search API response.
type contactsSearchResponse struct {
	Payload []Contact `json:"payload"`
}

// conversationResponse wraps the API response for conversation operations.
type conversationResponse struct {
	ID        int64  `json:"id"`
	InboxID   int    `json:"inbox_id"`
	ContactID int64  `json:"contact_id"`
	Status    string `json:"status"`
}

func (c *Client) CreateContact(ctx context.Context, contact Contact) (*Contact, error) {
	body, err := json.Marshal(contact)
	if err != nil {
		return nil, fmt.Errorf("marshaling contact: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/contacts", c.baseURL, c.accountID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("create contact failed: status %d", resp.StatusCode)
	}

	var result contactResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	return &result.Payload, nil
}

func (c *Client) GetContactByPhone(ctx context.Context, phone string) (*Contact, error) {
	payload := map[string]interface{}{
		"payload": []map[string]interface{}{
			{
				"attribute_key":   "phone_number",
				"filter_operator": "equal_to",
				"values":          []string{phone},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshaling filter: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/contacts/filter", c.baseURL, c.accountID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("filter contacts failed: status %d", resp.StatusCode)
	}

	var result contactsSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	if len(result.Payload) == 0 {
		return nil, nil
	}

	return &result.Payload[0], nil
}

func (c *Client) UpsertContact(ctx context.Context, contact Contact) (*Contact, error) {
	body, err := json.Marshal(contact)
	if err != nil {
		return nil, fmt.Errorf("marshaling contact: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/contacts", c.baseURL, c.accountID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("upsert contact failed: status %d", resp.StatusCode)
	}

	var result contactResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	return &result.Payload, nil
}

func (c *Client) SendMessage(ctx context.Context, conversationID int64, msg Message) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("marshaling message: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/conversations/%d/messages", c.baseURL, c.accountID, conversationID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("send message failed: status %d", resp.StatusCode)
	}

	return nil
}

func (c *Client) CreateConversation(ctx context.Context, contactID int64, inboxID int) (*Conversation, error) {
	payload := map[string]interface{}{
		"source_id":  contactID,
		"inbox_id":   inboxID,
		"contact_id": contactID,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshaling conversation: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/conversations", c.baseURL, c.accountID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("create conversation failed: status %d", resp.StatusCode)
	}

	var result conversationResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}

	return &Conversation{
		ID:        result.ID,
		InboxID:   result.InboxID,
		ContactID: result.ContactID,
		Status:    result.Status,
	}, nil
}

func (c *Client) ResolveConversation(ctx context.Context, conversationID int64) error {
	payload := map[string]string{"status": "resolved"}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshaling status: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/accounts/%d/conversations/%d/toggle_status", c.baseURL, c.accountID, conversationID)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("api_access_token", c.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resolve conversation failed: status %d", resp.StatusCode)
	}

	return nil
}
