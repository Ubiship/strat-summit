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
