package handler

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// parseUUID parses a UUID string
func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

// parseListOptions extracts pagination options from query params
func parseListOptions(r *http.Request) domain.ListOptions {
	opts := domain.ListOptions{
		Limit:  50,
		Offset: 0,
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			opts.Limit = limit
		}
	}

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			opts.Offset = offset
		}
	}

	return opts
}
