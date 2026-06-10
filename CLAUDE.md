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
├── backend/                  # Go API service → Railway
│   ├── cmd/server/           # main.go entrypoint
│   ├── internal/
│   │   ├── auth/             # JWT generation, validation, middleware
│   │   ├── config/           # Environment variable loading
│   │   ├── domain/           # Entity structs and enums
│   │   ├── handler/          # HTTP handlers (chi router)
│   │   ├── integrations/     # External service clients (Chatwoot, Novu, etc.)
│   │   ├── jobs/             # Background jobs & cron scheduler
│   │   ├── repository/       # Data access layer (pgx)
│   │   └── service/          # Business logic layer
│   └── migrations/           # golang-migrate SQL files
├── apps/
│   ├── web/                  # Next.js marketing site + public portal → Vercel
│   └── admin/                # Next.js admin dashboard → Vercel
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── types/                # Shared TypeScript types
│   ├── tailwind-config/      # Shared Tailwind theme (Strathcona brand)
│   └── typescript-config/    # Shared TS config
└── docs/                     # Project specifications
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
- **Monorepo:** pnpm workspaces + Turbo

## Current Implementation Status

### Backend (Go) - Feature Complete for P0

| Component | Status | Notes |
|-----------|--------|-------|
| Auth (JWT) | Done | Login, refresh, logout, role-based access |
| Properties | Done | CRUD, tier assignment, ownership |
| Bookings | Done | Create from Airbnb/VRBO/direct, auto-tax calc |
| Cleaning Jobs | Done | Auto-create from booking, assignment, clock in/out |
| Contacts | Done | CRUD, Chatwoot sync, pending contact workflow |
| Chatwoot Integration | Done | Webhook handler, contact sync, conversation linking |
| Novu Integration | Partial | Client wired, triggers stubbed |

### Frontend - Monorepo Structure Complete

| App | Status | Notes |
|-----|--------|-------|
| `apps/web` | Done | Marketing site with Strathcona branding |
| `apps/admin` | Scaffold | Layout/routing ready, pages need implementation |

### API Endpoints Implemented

```
GET  /health
POST /api/v1/auth/login|refresh|logout
GET|POST /api/v1/properties/
GET|PUT  /api/v1/properties/{id}
GET|POST /api/v1/bookings/
GET      /api/v1/bookings/{id}
GET      /api/v1/jobs/
GET      /api/v1/jobs/{id}
POST     /api/v1/jobs/{id}/clock-in|clock-out
PUT      /api/v1/jobs/{id}/status
POST     /api/v1/jobs/{id}/assign
GET|POST /api/v1/contacts/
GET      /api/v1/contacts/{id}
POST     /api/v1/admin/pending-contacts/
GET      /api/v1/admin/pending-contacts/{id}
POST     /api/v1/admin/pending-contacts/{id}/approve|create|reject
POST     /webhooks/chatwoot
```

## Key Documentation

- `docs/00_PROJECT.md` - Master specification, phases, ADRs
- `docs/01_DATA_MODEL.md` - Complete PostgreSQL schema
- `docs/02_PAYOUT_ENGINE.md` - Payout calculation logic
- `docs/07_INTEGRATIONS.md` - External service integrations
- `docs/08_INFRASTRUCTURE.md` - Railway deployment config

## Deployment

- **Web App (`apps/web`):** Vercel (automatic from main branch)
- **Admin App (`apps/admin`):** Vercel (automatic from main branch)
- **Backend:** Railway (Docker container)
- **Services:** All self-hosted on Railway (Postgres, Redis, MinIO, Novu, Cal.com, Chatwoot, Gotenberg)

## Environment Variables

- Backend: See `backend/.env.example`
- Web app: See `apps/web/.env.example`
- Admin app: See `apps/admin/.env.example`

## Git Conventions

- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- Branch naming: `feature/description`, `fix/description`
- PRs required for main branch

## Commands

```bash
# Root (monorepo)
pnpm install              # Install all dependencies
pnpm dev                  # Start all apps in dev mode
pnpm build                # Build all apps
pnpm lint                 # Lint all packages

# Individual apps
pnpm --filter web dev     # Start web app only
pnpm --filter admin dev   # Start admin app only

# Backend
cd backend
go run ./cmd/server       # Start Go server
go test ./...             # Run tests
go build ./...            # Build binary
```
