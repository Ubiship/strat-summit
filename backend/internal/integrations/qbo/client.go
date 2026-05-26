package qbo

import (
	"context"
	"net/http"
)

type Client struct {
	clientID     string
	clientSecret string
	redirectURI  string
	http         *http.Client
}

type Config struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

func New(cfg Config) *Client {
	return &Client{
		clientID:     cfg.ClientID,
		clientSecret: cfg.ClientSecret,
		redirectURI:  cfg.RedirectURI,
		http:         &http.Client{},
	}
}

func (c *Client) AuthURL(state string) string {
	// TODO: implement OAuth URL generation
	return ""
}

func (c *Client) ExchangeCode(ctx context.Context, code string) (string, string, error) {
	// TODO: implement token exchange
	return "", "", nil
}

func (c *Client) CreateInvoice(ctx context.Context, accessToken string, invoice interface{}) error {
	// TODO: implement
	return nil
}
