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

````bash
# Frontend
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # Run ESLint

# Backend
cd backend
go run ./cmd/server   # Start Go server
go test ./...         # Run tests
go build ./...        # Build binary
````
