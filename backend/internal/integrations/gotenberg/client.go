package gotenberg

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
)

type Client struct {
	baseURL string
	http    *http.Client
}

func New(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		http:    &http.Client{},
	}
}

type PDFRequest struct {
	HTML   string
	Assets map[string][]byte
}

func (c *Client) HTMLtoPDF(ctx context.Context, req PDFRequest) ([]byte, error) {
	body := &bytes.Buffer{}
	w := multipart.NewWriter(body)

	// Write index.html
	fw, _ := w.CreateFormFile("files", "index.html")
	fw.Write([]byte(req.HTML))

	// Write any assets
	for name, data := range req.Assets {
		fw, _ = w.CreateFormFile("files", name)
		fw.Write(data)
	}

	w.Close()

	httpReq, _ := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/forms/chromium/convert/html", body)
	httpReq.Header.Set("Content-Type", w.FormDataContentType())

	resp, err := c.http.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}
