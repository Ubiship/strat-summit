package chatwoot

import (
	"context"
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
	// TODO: implement in Task 3
	return nil, nil
}

func (c *Client) GetContactByPhone(ctx context.Context, phone string) (*Contact, error) {
	// TODO: implement in Task 3
	return nil, nil
}

func (c *Client) UpsertContact(ctx context.Context, contact Contact) (*Contact, error) {
	// TODO: implement in Task 3
	return nil, nil
}

func (c *Client) SendMessage(ctx context.Context, conversationID int64, msg Message) error {
	// TODO: implement in Task 3
	return nil
}

func (c *Client) CreateConversation(ctx context.Context, contactID int64, inboxID int) (*Conversation, error) {
	// TODO: implement in Task 3
	return nil, nil
}

func (c *Client) ResolveConversation(ctx context.Context, conversationID int64) error {
	// TODO: implement in Task 3
	return nil
}
