package novu

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
)

type Client struct {
	apiKey  string
	baseURL string
	http    *http.Client
}

type Config struct {
	APIKey  string
	BaseURL string
}

func New(cfg Config) *Client {
	return &Client{
		apiKey:  cfg.APIKey,
		baseURL: cfg.BaseURL,
		http:    &http.Client{},
	}
}

type TriggerPayload struct {
	To      Subscriber             `json:"to"`
	Payload map[string]interface{} `json:"payload"`
}

type Subscriber struct {
	SubscriberID string `json:"subscriberId"`
	Email        string `json:"email,omitempty"`
	Phone        string `json:"phone,omitempty"`
	FirstName    string `json:"firstName,omitempty"`
	LastName     string `json:"lastName,omitempty"`
}

func (c *Client) Trigger(ctx context.Context, eventID string, payload TriggerPayload) error {
	body, _ := json.Marshal(map[string]interface{}{
		"name": eventID,
		"to":   payload.To,
		"payload": payload.Payload,
	})

	req, _ := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/v1/events/trigger", bytes.NewReader(body))
	req.Header.Set("Authorization", "ApiKey "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
