package novu

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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
		http: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type Subscriber struct {
	SubscriberID string `json:"subscriberId"`
	Email        string `json:"email,omitempty"`
	Phone        string `json:"phone,omitempty"`
	FirstName    string `json:"firstName,omitempty"`
	LastName     string `json:"lastName,omitempty"`
}

// UpsertSubscriber creates or updates a subscriber in Novu.
func (c *Client) UpsertSubscriber(ctx context.Context, subscriber Subscriber) error {
	body, err := json.Marshal(subscriber)
	if err != nil {
		return fmt.Errorf("marshaling subscriber: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/v1/subscribers", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", "ApiKey "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("upsert subscriber failed: status %d", resp.StatusCode)
	}

	return nil
}

// DeleteSubscriber removes a subscriber from Novu.
func (c *Client) DeleteSubscriber(ctx context.Context, subscriberID string) error {
	req, err := http.NewRequestWithContext(ctx, "DELETE", c.baseURL+"/v1/subscribers/"+subscriberID, nil)
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", "ApiKey "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("delete subscriber failed: status %d", resp.StatusCode)
	}

	return nil
}

// BulkTrigger sends a notification to multiple subscribers at once.
func (c *Client) BulkTrigger(ctx context.Context, eventID string, subscriberIDs []string, payload map[string]interface{}) error {
	if len(subscriberIDs) == 0 {
		return nil
	}

	events := make([]map[string]interface{}, len(subscriberIDs))
	for i, subID := range subscriberIDs {
		events[i] = map[string]interface{}{
			"to":      map[string]string{"subscriberId": subID},
			"payload": payload,
		}
	}

	body, err := json.Marshal(map[string]interface{}{
		"name":   eventID,
		"events": events,
	})
	if err != nil {
		return fmt.Errorf("marshaling bulk trigger: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/v1/events/trigger/bulk", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", "ApiKey "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("bulk trigger failed: status %d", resp.StatusCode)
	}

	return nil
}

// Trigger sends a notification to a single subscriber.
func (c *Client) Trigger(ctx context.Context, eventID string, subscriberID string, payload map[string]interface{}) error {
	body, err := json.Marshal(map[string]interface{}{
		"name": eventID,
		"to": map[string]string{
			"subscriberId": subscriberID,
		},
		"payload": payload,
	})
	if err != nil {
		return fmt.Errorf("marshaling trigger: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/v1/events/trigger", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Authorization", "ApiKey "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("trigger failed: status %d", resp.StatusCode)
	}

	return nil
}
