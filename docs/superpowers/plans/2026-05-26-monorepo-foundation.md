# Monorepo Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Strathcona Summit codebase into a pnpm monorepo with Go backend and Next.js frontend workspaces.

**Architecture:** Move existing Next.js app to `frontend/`, create Go backend scaffold in `backend/`, establish CLAUDE.md files at root and in each workspace. Use pnpm workspaces for JavaScript tooling, Go modules for backend.

**Tech Stack:** pnpm, Go 1.22, Next.js 16, chi router, pgx, minio-go

---

## File Structure Overview

**Files to move:**
```
src/                    → frontend/src/
package.json            → frontend/package.json
package-lock.json       → (delete, pnpm will create pnpm-lock.yaml)
next.config.mjs         → frontend/next.config.mjs
tsconfig.json           → frontend/tsconfig.json
postcss.config.js       → frontend/postcss.config.js
prettier.config.js      → frontend/prettier.config.js
eslint.config.mjs       → frontend/eslint.config.mjs
mdx-components.tsx      → frontend/mdx-components.tsx
.env.example            → frontend/.env.example
next-env.d.ts           → frontend/next-env.d.ts
00_PROJECT.md           → docs/00_PROJECT.md
01_DATA_MODEL.md        → docs/01_DATA_MODEL.md
02_PAYOUT_ENGINE.md     → docs/02_PAYOUT_ENGINE.md
07_INTEGRATIONS.md      → docs/07_INTEGRATIONS.md
08_INFRASTRUCTURE.md    → docs/08_INFRASTRUCTURE.md
CHANGELOG.md            → docs/CHANGELOG.md
```

**Files to delete:**
```
.next/
node_modules/
Context/
package-lock.json
README.md               → (replace with new root README)
```

**Files to create:**
```
package.json            # Root workspace
pnpm-workspace.yaml
CLAUDE.md               # Root
frontend/CLAUDE.md
backend/CLAUDE.md
backend/go.mod
backend/go.sum
backend/Dockerfile
backend/.env.example
backend/cmd/server/main.go
backend/internal/config/config.go
backend/internal/domain/entities.go
backend/internal/auth/jwt.go
backend/internal/handler/health.go
backend/internal/handler/router.go
backend/internal/repository/repository.go
backend/internal/service/service.go
backend/internal/integrations/chatwoot/client.go
backend/internal/integrations/gotenberg/client.go
backend/internal/integrations/minio/client.go
backend/internal/integrations/novu/client.go
backend/internal/integrations/qbo/client.go
backend/internal/jobs/jobs.go
backend/migrations/.keep
backend/templates/pdf/.keep
strat-summit.code-workspace
README.md
```

---

## Task 1: Clean Up and Prepare

**Files:**
- Delete: `.next/`, `node_modules/`, `Context/`, `package-lock.json`

- [ ] **Step 1: Remove build artifacts and dependencies**

```bash
rm -rf .next node_modules Context package-lock.json
```

- [ ] **Step 2: Verify clean state**

```bash
ls -la
```
Expected: No `.next/`, `node_modules/`, `Context/`, or `package-lock.json`

- [ ] **Step 3: Commit clean state**

```bash
git add -A
git commit -m "chore: clean up build artifacts before restructure"
```

---

## Task 2: Create Directory Structure

**Files:**
- Create: `frontend/`, `backend/cmd/server/`, `backend/internal/*/`, `backend/migrations/`, `backend/templates/pdf/`

- [ ] **Step 1: Create frontend directory**

```bash
mkdir -p frontend
```

- [ ] **Step 2: Create backend directory structure**

```bash
mkdir -p backend/cmd/server
mkdir -p backend/internal/auth
mkdir -p backend/internal/config
mkdir -p backend/internal/domain
mkdir -p backend/internal/handler
mkdir -p backend/internal/repository
mkdir -p backend/internal/service
mkdir -p backend/internal/jobs
mkdir -p backend/internal/integrations/chatwoot
mkdir -p backend/internal/integrations/gotenberg
mkdir -p backend/internal/integrations/minio
mkdir -p backend/internal/integrations/novu
mkdir -p backend/internal/integrations/qbo
mkdir -p backend/migrations
mkdir -p backend/templates/pdf
```

- [ ] **Step 3: Verify structure**

```bash
find backend -type d
```
Expected: All directories listed above

---

## Task 3: Move Frontend Files

**Files:**
- Move: All frontend-related files to `frontend/`

- [ ] **Step 1: Move source and config files**

```bash
git mv src frontend/src
git mv package.json frontend/package.json
git mv next.config.mjs frontend/next.config.mjs
git mv tsconfig.json frontend/tsconfig.json
git mv postcss.config.js frontend/postcss.config.js
git mv prettier.config.js frontend/prettier.config.js
git mv eslint.config.mjs frontend/eslint.config.mjs
git mv mdx-components.tsx frontend/mdx-components.tsx
git mv .env.example frontend/.env.example
git mv next-env.d.ts frontend/next-env.d.ts
```

- [ ] **Step 2: Verify files moved**

```bash
ls frontend/
```
Expected: `src/`, `package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.js`, `prettier.config.js`, `eslint.config.mjs`, `mdx-components.tsx`, `.env.example`, `next-env.d.ts`

- [ ] **Step 3: Commit frontend move**

```bash
git add -A
git commit -m "refactor: move frontend files to frontend/"
```

---

## Task 4: Move Documentation Files

**Files:**
- Move: Spec docs to `docs/`

- [ ] **Step 1: Move spec documents**

```bash
git mv 00_PROJECT.md docs/00_PROJECT.md
git mv 01_DATA_MODEL.md docs/01_DATA_MODEL.md
git mv 02_PAYOUT_ENGINE.md docs/02_PAYOUT_ENGINE.md
git mv 07_INTEGRATIONS.md docs/07_INTEGRATIONS.md
git mv 08_INFRASTRUCTURE.md docs/08_INFRASTRUCTURE.md
git mv CHANGELOG.md docs/CHANGELOG.md
```

- [ ] **Step 2: Remove old README (will replace with new one)**

```bash
rm README.md
```

- [ ] **Step 3: Verify docs moved**

```bash
ls docs/
```
Expected: `00_PROJECT.md`, `01_DATA_MODEL.md`, `02_PAYOUT_ENGINE.md`, `07_INTEGRATIONS.md`, `08_INFRASTRUCTURE.md`, `CHANGELOG.md`, `superpowers/`

- [ ] **Step 4: Commit docs move**

```bash
git add -A
git commit -m "refactor: move documentation to docs/"
```

---

## Task 5: Create Root Workspace Configuration

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`

- [ ] **Step 1: Create root package.json**

Create file `package.json`:

```json
{
  "name": "strat-summit",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter frontend dev",
    "build": "pnpm --filter frontend build",
    "start": "pnpm --filter frontend start",
    "lint": "pnpm --filter frontend lint"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

Create file `pnpm-workspace.yaml`:

```yaml
packages:
  - "frontend"
```

- [ ] **Step 3: Commit workspace config**

```bash
git add package.json pnpm-workspace.yaml
git commit -m "chore: add pnpm workspace configuration"
```

---

## Task 6: Create VS Code Workspace Configuration

**Files:**
- Create: `strat-summit.code-workspace`

- [ ] **Step 1: Create workspace file**

Create file `strat-summit.code-workspace`:

```json
{
  "folders": [
    {
      "path": ".",
      "name": "root"
    },
    {
      "path": "backend",
      "name": "backend (Go)"
    },
    {
      "path": "frontend",
      "name": "frontend (Next.js)"
    }
  ],
  "settings": {
    "typescript.tsdk": "frontend/node_modules/typescript/lib",
    "go.gopath": null,
    "editor.formatOnSave": true,
    "[go]": {
      "editor.defaultFormatter": "golang.go"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  },
  "extensions": {
    "recommendations": [
      "golang.go",
      "esbenp.prettier-vscode",
      "bradlc.vscode-tailwindcss",
      "dbaeumer.vscode-eslint"
    ]
  }
}
```

- [ ] **Step 2: Commit workspace file**

```bash
git add strat-summit.code-workspace
git commit -m "chore: add VS Code workspace configuration"
```

---

## Task 7: Create Root README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README**

Create file `README.md`:

```markdown
# Strathcona Summit Solutions

Custom operational platform for property management, renovations, and cleaning services.

## Structure

```
strat-summit/
├── backend/     # Go API service (Railway)
├── frontend/    # Next.js web app (Vercel)
└── docs/        # Project specifications
```

## Quick Start

### Frontend (Next.js)

```bash
pnpm install
pnpm dev
```

### Backend (Go)

```bash
cd backend
go run ./cmd/server
```

## Documentation

- [Project Spec](docs/00_PROJECT.md)
- [Data Model](docs/01_DATA_MODEL.md)
- [Payout Engine](docs/02_PAYOUT_ENGINE.md)
- [Integrations](docs/07_INTEGRATIONS.md)
- [Infrastructure](docs/08_INFRASTRUCTURE.md)

## Tech Stack

| Layer | Technology | Host |
|-------|------------|------|
| Frontend | Next.js 16, React 19, Tailwind v4 | Vercel |
| Backend | Go 1.22, chi, pgx | Railway |
| Database | PostgreSQL 15 | Railway |
| Storage | MinIO | Railway |
| Notifications | Novu | Railway |
| Scheduling | Cal.com | Railway |
| Inbox | Chatwoot | Railway |
```

- [ ] **Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add root README with project overview"
```

---

## Task 8: Create Root CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create root CLAUDE.md**

Create file `CLAUDE.md`:

```markdown
# Strathcona Summit Solutions

## Project Overview

Custom operational platform for Strathcona Summit Solutions, a Vancouver Island business with three pillars:

1. **Property Management & Cleaning** (P0 - Active) - vacation rental management
2. **Renovations & Construction** (P1 - Active, seasonal)
3. **Laundromat** (P3 - Pre-launch, stub only)

Built by UbiShip Limited. Monthly subscription model.

## Repository Structure

```
strat-summit/
├── backend/     # Go API service → Railway
├── frontend/    # Next.js web app → Vercel
└── docs/        # Project specifications
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Go 1.22 with chi router, pgx for Postgres
- **Database:** PostgreSQL 15 (self-hosted on Railway)
- **Storage:** MinIO (S3-compatible, self-hosted)
- **Notifications:** Novu (self-hosted)
- **Scheduling:** Cal.com (self-hosted)
- **Inbox:** Chatwoot (self-hosted)
- **PDF Generation:** Gotenberg

## Key Documentation

- `docs/00_PROJECT.md` - Master specification, phases, ADRs
- `docs/01_DATA_MODEL.md` - Complete PostgreSQL schema
- `docs/02_PAYOUT_ENGINE.md` - Payout calculation logic
- `docs/07_INTEGRATIONS.md` - External service integrations
- `docs/08_INFRASTRUCTURE.md` - Railway deployment config

## Deployment

- **Frontend:** Vercel (automatic from main branch)
- **Backend:** Railway (Docker container)
- **Services:** All self-hosted on Railway (Postgres, Redis, MinIO, Novu, Cal.com, Chatwoot, Gotenberg)

## Environment Variables

See `frontend/.env.example` and `backend/.env.example` for required variables.

## Git Conventions

- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- Branch naming: `feature/description`, `fix/description`
- PRs required for main branch

## Commands

```bash
# Frontend
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # Run ESLint

# Backend
cd backend
go run ./cmd/server   # Start Go server
go test ./...         # Run tests
go build ./...        # Build binary
```
```

- [ ] **Step 2: Commit root CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "docs: add root CLAUDE.md for AI context"
```

---

## Task 9: Create Backend CLAUDE.md

**Files:**
- Create: `backend/CLAUDE.md`

- [ ] **Step 1: Create backend CLAUDE.md**

Create file `backend/CLAUDE.md`:

```markdown
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
```

- [ ] **Step 2: Commit backend CLAUDE.md**

```bash
git add backend/CLAUDE.md
git commit -m "docs: add backend CLAUDE.md for Go development context"
```

---

## Task 10: Create Frontend CLAUDE.md

**Files:**
- Create: `frontend/CLAUDE.md`

- [ ] **Step 1: Create frontend CLAUDE.md**

Create file `frontend/CLAUDE.md`:

```markdown
# Frontend - Next.js App

## Overview

Next.js 16 web application for Strathcona Summit platform. Serves multiple user portals with role-based access.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript 5.8

## Portal Structure

Route groups for different user types:

```
src/app/
├── (admin)/        # Joel & Amanda - full platform access
├── (staff)/        # Cleaning staff - mobile-first job views
├── (owner)/        # Property owners - statements, property info
├── (client)/       # Renovation clients - project tracking
├── (subtrade)/     # Subcontractors - assigned work
├── contact/        # Public contact form
├── property-management/  # Public service page
├── renovations/    # Public service page
├── about/          # Public about page
└── page.tsx        # Public homepage
```

## Component Organization

```
src/components/
├── ui/             # Primitive UI components (buttons, inputs, cards)
├── layout/         # Layout components (header, footer, nav)
├── forms/          # Form components with validation
└── [feature]/      # Feature-specific components
```

## Styling

Tailwind CSS v4 with custom brand colors:

```css
/* Brand colors */
--color-forest: #1B4332;    /* Primary green */
--color-stone: #D4C5B5;     /* Neutral warm */
--color-copper: #B87333;    /* Accent */
```

Use Tailwind classes. Avoid inline styles. Use `clsx` for conditional classes.

## Server Components vs Client Components

- **Default to Server Components** - better performance, no client JS
- **Use Client Components for:**
  - Interactive forms
  - Components using hooks (useState, useEffect)
  - Components using browser APIs
  - Components with event handlers

Mark client components with `'use client'` directive at top of file.

## Server Actions

Prefer Server Actions over API routes for mutations:

```tsx
// src/lib/actions.ts
'use server'

export async function submitContactForm(formData: FormData) {
  // Validate, process, return result
}
```

## Authentication Flow

JWT-based auth from Go backend:
1. Login form posts to `/api/auth/login` (proxied to backend)
2. Backend returns access + refresh tokens
3. Store access token in memory, refresh in httpOnly cookie
4. Include token in Authorization header for API calls

## API Calls

Use server-side fetching when possible:

```tsx
// In Server Component
async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await fetch(`${API_URL}/properties/${params.id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    next: { revalidate: 60 }
  }).then(r => r.json())

  return <PropertyView property={property} />
}
```

## Environment Variables

```bash
# Public (available in browser)
NEXT_PUBLIC_API_URL=https://api.strathcona...
NEXT_PUBLIC_SITE_URL=https://strathcona...

# Server-only
RESEND_API_KEY=re_...
CONTACT_EMAIL=hello@...
```

## Commands

```bash
pnpm dev      # Start dev server (port 3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Testing

(To be configured - likely Vitest + React Testing Library)

## Key Files

- `src/lib/site.ts` - Site configuration and metadata
- `src/lib/actions.ts` - Server Actions
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
```

- [ ] **Step 2: Commit frontend CLAUDE.md**

```bash
git add frontend/CLAUDE.md
git commit -m "docs: add frontend CLAUDE.md for Next.js development context"
```

---

## Task 11: Create Go Module and Dependencies

**Files:**
- Create: `backend/go.mod`, `backend/go.sum`

- [ ] **Step 1: Initialize Go module**

```bash
cd backend
go mod init github.com/ubiship/strat-summit/backend
```

- [ ] **Step 2: Add dependencies**

```bash
go get github.com/go-chi/chi/v5@v5.0.12
go get github.com/jackc/pgx/v5@v5.5.5
go get github.com/minio/minio-go/v7@v7.0.70
go get github.com/golang-jwt/jwt/v5@v5.2.1
go get github.com/joho/godotenv@v1.5.1
go get github.com/google/uuid@v1.6.0
```

- [ ] **Step 3: Verify go.mod**

```bash
cat go.mod
```
Expected: Module path and all dependencies listed

- [ ] **Step 4: Return to root and commit**

```bash
cd ..
git add backend/go.mod backend/go.sum
git commit -m "chore: initialize Go module with dependencies"
```

---

## Task 12: Create Go Config Package

**Files:**
- Create: `backend/internal/config/config.go`

- [ ] **Step 1: Create config.go**

Create file `backend/internal/config/config.go`:

```go
package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   []byte
	JWTAccessTTL  time.Duration
	JWTRefreshTTL time.Duration

	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioUseSSL    bool

	NovuAPIKey string
	NovuAPIURL string

	GotenbergURL string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	accessTTL, _ := strconv.Atoi(getEnv("JWT_ACCESS_TTL_MIN", "15"))
	refreshTTL, _ := strconv.Atoi(getEnv("JWT_REFRESH_TTL_DAYS", "30"))
	minioSSL, _ := strconv.ParseBool(getEnv("MINIO_USE_SSL", "true"))

	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		JWTSecret:     []byte(os.Getenv("JWT_SECRET")),
		JWTAccessTTL:  time.Duration(accessTTL) * time.Minute,
		JWTRefreshTTL: time.Duration(refreshTTL) * 24 * time.Hour,

		MinioEndpoint:  os.Getenv("MINIO_ENDPOINT"),
		MinioAccessKey: os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey: os.Getenv("MINIO_SECRET_KEY"),
		MinioUseSSL:    minioSSL,

		NovuAPIKey: os.Getenv("NOVU_API_KEY"),
		NovuAPIURL: getEnv("NOVU_API_URL", "http://localhost:3000"),

		GotenbergURL: getEnv("GOTENBERG_URL", "http://localhost:3000"),
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
```

- [ ] **Step 2: Commit config package**

```bash
git add backend/internal/config/config.go
git commit -m "feat(backend): add config package for environment loading"
```

---

## Task 13: Create Go Domain Package

**Files:**
- Create: `backend/internal/domain/entities.go`

- [ ] **Step 1: Create entities.go**

Create file `backend/internal/domain/entities.go`:

```go
package domain

import (
	"time"

	"github.com/google/uuid"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleStaff    UserRole = "staff"
	RoleOwner    UserRole = "owner"
	RoleClient   UserRole = "client"
	RoleSubtrade UserRole = "subtrade"
)

// User represents an authenticated user account
type User struct {
	ID               uuid.UUID  `json:"id"`
	ContactID        uuid.UUID  `json:"contact_id"`
	Email            string     `json:"email"`
	PasswordHash     string     `json:"-"`
	Role             UserRole   `json:"role"`
	Active           bool       `json:"active"`
	RefreshTokenHash *string    `json:"-"`
	RefreshExpiresAt *time.Time `json:"-"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// Contact represents a person in the system (staff, owner, client, subtrade)
type Contact struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ServiceTier represents the level of service for a property
type ServiceTier int

const (
	TierBasicCleaning ServiceTier = 1
	TierCleaning      ServiceTier = 2
	TierFullPM        ServiceTier = 3
)

// Property represents a managed vacation rental property
type Property struct {
	ID          uuid.UUID   `json:"id"`
	Name        string      `json:"name"`
	Address     string      `json:"address"`
	Tier        ServiceTier `json:"tier"`
	OwnerID     uuid.UUID   `json:"owner_id"`
	Active      bool        `json:"active"`
	AccessCodes string      `json:"access_codes,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// Booking represents a guest booking at a property
type Booking struct {
	ID           uuid.UUID  `json:"id"`
	PropertyID   uuid.UUID  `json:"property_id"`
	Source       string     `json:"source"` // airbnb, vrbo, direct
	GuestName    string     `json:"guest_name"`
	CheckIn      time.Time  `json:"check_in"`
	CheckOut     time.Time  `json:"check_out"`
	GrossRevenue int64      `json:"gross_revenue"` // cents
	Status       string     `json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// CleaningJob represents a cleaning job for a property
type CleaningJob struct {
	ID           uuid.UUID  `json:"id"`
	PropertyID   uuid.UUID  `json:"property_id"`
	BookingID    *uuid.UUID `json:"booking_id,omitempty"`
	ScheduledFor time.Time  `json:"scheduled_for"`
	Status       string     `json:"status"` // pending, in_progress, completed
	AssignedTo   []uuid.UUID `json:"assigned_to"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
```

- [ ] **Step 2: Commit domain package**

```bash
git add backend/internal/domain/entities.go
git commit -m "feat(backend): add domain entities for core business objects"
```

---

## Task 14: Create Go Auth Package

**Files:**
- Create: `backend/internal/auth/jwt.go`

- [ ] **Step 1: Create jwt.go**

Create file `backend/internal/auth/jwt.go`:

```go
package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token expired")
)

type ctxKey string

const CtxKeyAuth ctxKey = "auth"

// Claims represents JWT claims for access tokens
type Claims struct {
	UserID    string          `json:"sub"`
	ContactID string          `json:"contact_id"`
	Role      domain.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// AuthContext holds authenticated user information extracted from JWT
type AuthContext struct {
	UserID    uuid.UUID
	ContactID uuid.UUID
	Role      domain.UserRole
}

// GenerateAccessToken creates a new JWT access token
func GenerateAccessToken(user *domain.User, secret []byte, ttl time.Duration) (string, error) {
	claims := Claims{
		UserID:    user.ID.String(),
		ContactID: user.ContactID.String(),
		Role:      user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// GenerateRefreshToken creates a random refresh token
func GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// ValidateToken parses and validates a JWT token
func ValidateToken(tokenString string, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// Authenticate is middleware that validates JWT and adds auth context
func Authenticate(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractBearer(r.Header.Get("Authorization"))
			if tokenString == "" {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			claims, err := ValidateToken(tokenString, secret)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			userID, _ := uuid.Parse(claims.UserID)
			contactID, _ := uuid.Parse(claims.ContactID)

			ctx := context.WithValue(r.Context(), CtxKeyAuth, &AuthContext{
				UserID:    userID,
				ContactID: contactID,
				Role:      claims.Role,
			})

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole is middleware that checks if user has required role
func RequireRole(roles ...domain.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth := AuthFromContext(r.Context())
			if auth == nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			for _, role := range roles {
				if auth.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, "forbidden", http.StatusForbidden)
		})
	}
}

// AuthFromContext extracts AuthContext from request context
func AuthFromContext(ctx context.Context) *AuthContext {
	auth, _ := ctx.Value(CtxKeyAuth).(*AuthContext)
	return auth
}

func extractBearer(header string) string {
	if strings.HasPrefix(header, "Bearer ") {
		return strings.TrimPrefix(header, "Bearer ")
	}
	return ""
}
```

- [ ] **Step 2: Commit auth package**

```bash
git add backend/internal/auth/jwt.go
git commit -m "feat(backend): add JWT authentication package"
```

---

## Task 15: Create Go Handler Package

**Files:**
- Create: `backend/internal/handler/health.go`, `backend/internal/handler/router.go`

- [ ] **Step 1: Create health.go**

Create file `backend/internal/handler/health.go`:

```go
package handler

import (
	"encoding/json"
	"net/http"
)

type HealthResponse struct {
	Status string `json:"status"`
	DB     string `json:"db,omitempty"`
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	resp := HealthResponse{
		Status: "ok",
		DB:     "ok", // TODO: add actual DB ping
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
```

- [ ] **Step 2: Create router.go**

Create file `backend/internal/handler/router.go`:

```go
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/ubiship/strat-summit/backend/internal/config"
)

type Handler struct {
	cfg *config.Config
}

func New(cfg *config.Config) *Handler {
	return &Handler{cfg: cfg}
}

func (h *Handler) Router() chi.Router {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(corsMiddleware)

	// Public routes
	r.Get("/health", h.Health)

	// API routes (will add auth middleware later)
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes
		r.Post("/auth/login", h.notImplemented)
		r.Post("/auth/refresh", h.notImplemented)
		r.Post("/auth/logout", h.notImplemented)

		// Protected routes (add auth middleware)
		r.Group(func(r chi.Router) {
			// Properties
			r.Route("/properties", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Post("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
				r.Put("/{id}", h.notImplemented)
			})

			// Bookings
			r.Route("/bookings", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Post("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
			})

			// Cleaning Jobs
			r.Route("/jobs", func(r chi.Router) {
				r.Get("/", h.notImplemented)
				r.Get("/{id}", h.notImplemented)
				r.Put("/{id}/status", h.notImplemented)
			})
		})
	})

	return r
}

func (h *Handler) notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "not implemented",
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
```

- [ ] **Step 3: Commit handler package**

```bash
git add backend/internal/handler/health.go backend/internal/handler/router.go
git commit -m "feat(backend): add HTTP handler package with router and health endpoint"
```

---

## Task 16: Create Go Repository and Service Stubs

**Files:**
- Create: `backend/internal/repository/repository.go`, `backend/internal/service/service.go`

- [ ] **Step 1: Create repository.go**

Create file `backend/internal/repository/repository.go`:

```go
package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// Repository provides data access methods
type Repository struct {
	db *pgxpool.Pool
}

// New creates a new Repository instance
func New(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// User methods

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) UpdateRefreshToken(ctx context.Context, userID uuid.UUID, hash *string, expiresAt *string) error {
	// TODO: implement
	return nil
}

// Property methods

func (r *Repository) CreateProperty(ctx context.Context, p *domain.Property) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetPropertyByID(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) ListProperties(ctx context.Context) ([]*domain.Property, error) {
	// TODO: implement
	return nil, nil
}

// Booking methods

func (r *Repository) CreateBooking(ctx context.Context, b *domain.Booking) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	// TODO: implement
	return nil, nil
}

// CleaningJob methods

func (r *Repository) CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status string) error {
	// TODO: implement
	return nil
}
```

- [ ] **Step 2: Create service.go**

Create file `backend/internal/service/service.go`:

```go
package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

// Service handles business logic
type Service struct {
	cfg  *config.Config
	repo *repository.Repository
}

// New creates a new Service instance
func New(cfg *config.Config, repo *repository.Repository) *Service {
	return &Service{
		cfg:  cfg,
		repo: repo,
	}
}

// Auth methods

func (s *Service) Login(ctx context.Context, email, password string) (*domain.User, string, string, error) {
	// TODO: implement
	// 1. Get user by email
	// 2. Verify password with bcrypt
	// 3. Generate access token
	// 4. Generate refresh token
	// 5. Store refresh token hash
	// 6. Return user, access token, refresh token
	return nil, "", "", nil
}

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	// TODO: implement
	return "", "", nil
}

func (s *Service) Logout(ctx context.Context, userID uuid.UUID) error {
	// TODO: implement
	return nil
}

// Property methods

func (s *Service) CreateProperty(ctx context.Context, p *domain.Property) error {
	return s.repo.CreateProperty(ctx, p)
}

func (s *Service) GetProperty(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	return s.repo.GetPropertyByID(ctx, id)
}

func (s *Service) ListProperties(ctx context.Context) ([]*domain.Property, error) {
	return s.repo.ListProperties(ctx)
}

// Booking methods

func (s *Service) CreateBooking(ctx context.Context, b *domain.Booking) error {
	// TODO: also create CleaningJob when booking is confirmed
	return s.repo.CreateBooking(ctx, b)
}

// CleaningJob methods

func (s *Service) UpdateJobStatus(ctx context.Context, id uuid.UUID, status string) error {
	return s.repo.UpdateCleaningJobStatus(ctx, id, status)
}
```

- [ ] **Step 3: Commit repository and service**

```bash
git add backend/internal/repository/repository.go backend/internal/service/service.go
git commit -m "feat(backend): add repository and service layer stubs"
```

---

## Task 17: Create Go Integration Stubs

**Files:**
- Create: Client stubs for each integration

- [ ] **Step 1: Create minio client stub**

Create file `backend/internal/integrations/minio/client.go`:

```go
package minio

import (
	"context"
	"io"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Client struct {
	mc     *minio.Client
	bucket string
}

type Config struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	UseSSL    bool
	Bucket    string
}

func New(cfg Config) (*Client, error) {
	mc, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, err
	}
	return &Client{mc: mc, bucket: cfg.Bucket}, nil
}

func (c *Client) PutObject(ctx context.Context, key string, data io.Reader, size int64, contentType string) error {
	_, err := c.mc.PutObject(ctx, c.bucket, key, data, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (c *Client) PresignedGetURL(ctx context.Context, key string) (string, error) {
	// TODO: implement with expiry
	return "", nil
}

func (c *Client) DeleteObject(ctx context.Context, key string) error {
	return c.mc.RemoveObject(ctx, c.bucket, key, minio.RemoveObjectOptions{})
}
```

- [ ] **Step 2: Create novu client stub**

Create file `backend/internal/integrations/novu/client.go`:

```go
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
```

- [ ] **Step 3: Create gotenberg client stub**

Create file `backend/internal/integrations/gotenberg/client.go`:

```go
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
```

- [ ] **Step 4: Create chatwoot client stub**

Create file `backend/internal/integrations/chatwoot/client.go`:

```go
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
```

- [ ] **Step 5: Create qbo client stub**

Create file `backend/internal/integrations/qbo/client.go`:

```go
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
```

- [ ] **Step 6: Commit integration stubs**

```bash
git add backend/internal/integrations/
git commit -m "feat(backend): add integration client stubs for external services"
```

---

## Task 18: Create Go Jobs Package Stub

**Files:**
- Create: `backend/internal/jobs/jobs.go`

- [ ] **Step 1: Create jobs.go**

Create file `backend/internal/jobs/jobs.go`:

```go
package jobs

import (
	"context"
	"log/slog"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/service"
)

type Jobs struct {
	svc    *service.Service
	logger *slog.Logger
}

func New(svc *service.Service, logger *slog.Logger) *Jobs {
	return &Jobs{
		svc:    svc,
		logger: logger,
	}
}

// Start begins all background job schedules
func (j *Jobs) Start(ctx context.Context) {
	go j.runICalSync(ctx)
	go j.runStatementGeneration(ctx)
}

// runICalSync polls Airbnb/VRBO iCal feeds every 15 minutes
func (j *Jobs) runICalSync(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			j.logger.Info("running iCal sync")
			// TODO: implement
		}
	}
}

// runStatementGeneration generates owner statements on the 1st of each month
func (j *Jobs) runStatementGeneration(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			if now.Day() == 1 && now.Hour() == 9 {
				j.logger.Info("running statement generation")
				// TODO: implement
			}
		}
	}
}
```

- [ ] **Step 2: Commit jobs package**

```bash
git add backend/internal/jobs/jobs.go
git commit -m "feat(backend): add background jobs package stub"
```

---

## Task 19: Create Go Main Entrypoint

**Files:**
- Create: `backend/cmd/server/main.go`

- [ ] **Step 1: Create main.go**

Create file `backend/cmd/server/main.go`:

```go
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/handler"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// Initialize handler
	h := handler.New(cfg)

	// Create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      h.Router(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("starting server", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	logger.Info("server stopped")
}
```

- [ ] **Step 2: Commit main entrypoint**

```bash
git add backend/cmd/server/main.go
git commit -m "feat(backend): add main server entrypoint with graceful shutdown"
```

---

## Task 20: Create Backend Dockerfile and .env.example

**Files:**
- Create: `backend/Dockerfile`, `backend/.env.example`

- [ ] **Step 1: Create Dockerfile**

Create file `backend/Dockerfile`:

```dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Runtime image
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/server /server
COPY --from=builder /app/migrations /migrations

EXPOSE 8080

CMD ["/server"]
```

- [ ] **Step 2: Create .env.example**

Create file `backend/.env.example`:

```bash
# Server
PORT=8080

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/strathcona

# Auth
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=30

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false

# Novu
NOVU_API_KEY=
NOVU_API_URL=http://localhost:3000

# Gotenberg
GOTENBERG_URL=http://localhost:3000

# Chatwoot
CHATWOOT_BASE_URL=
CHATWOOT_API_ACCESS_TOKEN=
CHATWOOT_ACCOUNT_ID=1

# QuickBooks
QBO_CLIENT_ID=
QBO_CLIENT_SECRET=
QBO_REDIRECT_URI=
```

- [ ] **Step 3: Create placeholder files for empty directories**

```bash
touch backend/migrations/.keep
touch backend/templates/pdf/.keep
```

- [ ] **Step 4: Commit Dockerfile and env example**

```bash
git add backend/Dockerfile backend/.env.example backend/migrations/.keep backend/templates/pdf/.keep
git commit -m "chore(backend): add Dockerfile, env example, and placeholder files"
```

---

## Task 21: Install pnpm Dependencies and Verify

**Files:**
- Verify: `frontend/package.json`, workspace setup

- [ ] **Step 1: Install pnpm if needed**

```bash
which pnpm || npm install -g pnpm
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```
Expected: Creates `pnpm-lock.yaml` and `node_modules/` in frontend

- [ ] **Step 3: Verify frontend dev server starts**

```bash
pnpm dev &
sleep 5
curl -s http://localhost:3000 | head -20
kill %1
```
Expected: HTML response from Next.js

- [ ] **Step 4: Commit lockfile**

```bash
git add pnpm-lock.yaml
git commit -m "chore: add pnpm lockfile"
```

---

## Task 22: Verify Go Build

**Files:**
- Verify: Go module compiles

- [ ] **Step 1: Tidy Go modules**

```bash
cd backend && go mod tidy && cd ..
```

- [ ] **Step 2: Build Go binary**

```bash
cd backend && go build ./... && cd ..
```
Expected: No errors

- [ ] **Step 3: Commit updated go.sum if changed**

```bash
git add backend/go.sum
git diff --cached --quiet || git commit -m "chore(backend): update go.sum after tidy"
```

---

## Task 23: Final Verification and Commit

**Files:**
- Verify: Complete structure

- [ ] **Step 1: Verify directory structure**

```bash
find . -type f -name "*.go" | grep -v node_modules | sort
find . -type f -name "CLAUDE.md" | sort
ls -la frontend/
ls -la backend/
ls -la docs/
```

Expected:
- Go files in `backend/`
- CLAUDE.md at root, backend/, frontend/
- Frontend files in `frontend/`
- Docs in `docs/`

- [ ] **Step 2: Run final lint check**

```bash
pnpm lint
```
Expected: No errors (or expected warnings only)

- [ ] **Step 3: Create summary commit**

```bash
git add -A
git status
git diff --cached --stat
```

If there are uncommitted changes:
```bash
git commit -m "chore: complete monorepo foundation setup"
```

- [ ] **Step 4: Verify git history**

```bash
git log --oneline -15
```

Expected: Clean commit history showing the restructure
