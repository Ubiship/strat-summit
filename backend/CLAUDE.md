# Backend - Go Service

## Overview

Go API service for Strathcona Summit platform. Handles all business logic, authentication, integrations, and background jobs.

## Module

```
module github.com/ubiship/strat-summit/backend
go 1.22
```

## Package Structure

```
backend/
├── cmd/server/          # Main entrypoint
├── internal/
│   ├── auth/            # JWT generation, validation, middleware
│   ├── config/          # Environment variable loading
│   ├── domain/          # Entity structs, interfaces
│   ├── handler/         # HTTP handlers (chi routes)
│   ├── repository/      # Database queries (pgx)
│   ├── service/         # Business logic layer
│   ├── jobs/            # Cron jobs (iCal sync, reports)
│   └── integrations/    # External service clients
│       ├── chatwoot/    # Unified inbox
│       ├── gotenberg/   # PDF generation
│       ├── minio/       # File storage
│       ├── novu/        # Notifications
│       └── qbo/         # QuickBooks Online
├── migrations/          # SQL migrations (golang-migrate)
└── templates/pdf/       # Gotenberg HTML templates
```

## Key Dependencies

- `github.com/go-chi/chi/v5` - HTTP router
- `github.com/jackc/pgx/v5` - PostgreSQL driver
- `github.com/minio/minio-go/v7` - S3-compatible storage
- `github.com/golang-jwt/jwt/v5` - JWT handling
- `github.com/joho/godotenv` - Environment loading

## Patterns

### Repository Pattern

```go
type PropertyRepository interface {
    Create(ctx context.Context, p *domain.Property) error
    GetByID(ctx context.Context, id uuid.UUID) (*domain.Property, error)
    List(ctx context.Context, opts ListOptions) ([]*domain.Property, error)
}
```

### Service Layer

Services contain business logic, call repositories and integrations:

```go
type PropertyService struct {
    repo   PropertyRepository
    minio  *minio.Client
    novu   *novu.Client
}
```

### Handler Pattern

Handlers are thin - validate input, call service, format response:

```go
func (h *Handler) CreateProperty(w http.ResponseWriter, r *http.Request) {
    var req CreatePropertyRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "invalid request")
        return
    }

    property, err := h.svc.CreateProperty(r.Context(), req)
    if err != nil {
        respondError(w, http.StatusInternalServerError, err.Error())
        return
    }

    respondJSON(w, http.StatusCreated, property)
}
```

### Error Handling

- Use domain-specific error types
- Wrap errors with context: `fmt.Errorf("creating property: %w", err)`
- Log at service layer, not handler

### API Response Format

```go
// Success
{"data": {...}}

// Error
{"error": {"message": "description", "code": "ERROR_CODE"}}
```

## Authentication

Custom JWT implementation:
- Access tokens: 15 min TTL, HS256 signed
- Refresh tokens: 30 day TTL, stored hashed in DB
- Middleware extracts claims, sets context

## Testing

```bash
go test ./...                    # All tests
go test ./internal/service/...   # Service tests only
go test -v -run TestName         # Single test
```

## Database Migrations

Using golang-migrate:

```bash
# Create new migration
migrate create -ext sql -dir migrations -seq create_properties

# Run migrations
migrate -path migrations -database $DATABASE_URL up

# Rollback one
migrate -path migrations -database $DATABASE_URL down 1
```

## Running Locally

```bash
# With .env file
go run ./cmd/server

# With explicit env
DATABASE_URL=postgres://... JWT_SECRET=... go run ./cmd/server
```

## Building

```bash
go build -o server ./cmd/server
./server
```
