package chatwoot

import (
	"context"
	"net/http"
)

type Client struct {
	baseURL   string
	apiToken  string
	accountID int
	http      *http.Client
}

type Config struct {
	BaseURL   string
	APIToken  string
	AccountID int
}

func New(cfg Config) *Client {
	return &Client{
		baseURL:   cfg.BaseURL,
		apiToken:  cfg.APIToken,
		accountID: cfg.AccountID,
		http:      &http.Client{},
	}
}

type Contact struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone_number"`
	ExternalID string `json:"identifier"`
}

type Message struct {
	Content     string `json:"content"`
	MessageType string `json:"message_type"`
	Private     bool   `json:"private"`
}

func (c *Client) CreateContact(ctx context.Context, contact Contact) (*Contact, error) {
	// TODO: implement
	return nil, nil
}

func (c *Client) SendMessage(ctx context.Context, conversationID int64, msg Message) error {
	// TODO: implement
	return nil
}
