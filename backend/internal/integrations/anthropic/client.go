package anthropic

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	defaultBaseURL = "https://api.anthropic.com"
	apiVersion     = "2023-06-01"
)

// Client handles communication with the Anthropic API.
type Client struct {
	apiKey  string
	model   string
	baseURL string
	http    *http.Client
}

// Config holds configuration for the Anthropic client.
type Config struct {
	APIKey string
	Model  string
}

// New creates a new Anthropic client.
func New(cfg Config) *Client {
	return &Client{
		apiKey:  cfg.APIKey,
		model:   cfg.Model,
		baseURL: defaultBaseURL,
		http: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// Message represents a conversation message.
type Message struct {
	Role    string `json:"role"`    // "user" or "assistant"
	Content string `json:"content"`
}

// messageRequest represents the API request body.
type messageRequest struct {
	Model     string    `json:"model"`
	MaxTokens int       `json:"max_tokens"`
	System    string    `json:"system,omitempty"`
	Messages  []Message `json:"messages"`
}

// contentBlock represents a content block in the API response.
type contentBlock struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

// messageResponse represents the API response.
type messageResponse struct {
	ID           string         `json:"id"`
	Type         string         `json:"type"`
	Role         string         `json:"role"`
	Content      []contentBlock `json:"content"`
	Model        string         `json:"model"`
	StopReason   string         `json:"stop_reason"`
	StopSequence *string        `json:"stop_sequence"`
	Usage        struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

// errorResponse represents an API error response.
type errorResponse struct {
	Type  string `json:"type"`
	Error struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error"`
}

// GenerateResponse generates a response using the Claude API.
// It takes a system prompt and a list of conversation messages.
func (c *Client) GenerateResponse(ctx context.Context, systemPrompt string, messages []Message) (string, error) {
	reqBody := messageRequest{
		Model:     c.model,
		MaxTokens: 1024,
		System:    systemPrompt,
		Messages:  messages,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshaling request: %w", err)
	}

	url := fmt.Sprintf("%s/v1/messages", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", apiVersion)

	resp, err := c.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("reading response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errResp errorResponse
		if err := json.Unmarshal(respBody, &errResp); err != nil {
			return "", fmt.Errorf("API error: status %d", resp.StatusCode)
		}
		return "", fmt.Errorf("API error: %s - %s", errResp.Error.Type, errResp.Error.Message)
	}

	var msgResp messageResponse
	if err := json.Unmarshal(respBody, &msgResp); err != nil {
		return "", fmt.Errorf("decoding response: %w", err)
	}

	// Extract text from content blocks
	var result string
	for _, block := range msgResp.Content {
		if block.Type == "text" {
			result += block.Text
		}
	}

	return result, nil
}
