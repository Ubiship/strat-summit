# Monorepo Foundation Design

**Date:** 2026-05-26
**Status:** Approved
**Author:** Claude + Max (UbiShip)

## Overview

Restructure the Strathcona Summit Solutions codebase from a single Next.js app at root into a monorepo with separate `backend/` (Go) and `frontend/` (Next.js) workspaces. Establish CLAUDE.md files for AI-assisted development and scaffold the Go backend structure.

## Decisions

| Decision | Choice |
|----------|--------|
| Package manager | pnpm workspaces |
| Go scaffold | Full structure from spec |
| CLAUDE.md scope | Root + backend + frontend |
| Docs location | `docs/` folder at root |
| VS Code workspace | Configure and commit |

## Directory Structure

```
strat-summit/
├── .github/
│   └── workflows/           # CI/CD (future)
├── backend/                 # Go service
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── auth/            # JWT generation, validation, middleware
│   │   ├── config/          # Environment loading
│   │   ├── domain/          # Entity structs, interfaces
│   │   ├── handler/         # HTTP handlers
│   │   ├── integrations/    # External services
│   │   │   ├── chatwoot/
│   │   │   ├── gotenberg/
│   │   │   ├── minio/
│   │   │   ├── novu/
│   │   │   └── qbo/
│   │   ├── repository/      # DB queries (pgx)
│   │   ├── service/         # Business logic
│   │   └── jobs/            # Cron jobs
│   ├── migrations/          # golang-migrate SQL files
│   ├── templates/
│   │   └── pdf/             # Gotenberg HTML templates
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── CLAUDE.md
├── frontend/                # Next.js app (moved from root)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── CLAUDE.md
├── docs/
│   ├── 00_PROJECT.md
│   ├── 01_DATA_MODEL.md
│   ├── 02_PAYOUT_ENGINE.md
│   ├── 07_INTEGRATIONS.md
│   ├── 08_INFRASTRUCTURE.md
│   └── superpowers/
│       └── specs/           # Design docs from brainstorming
├── pnpm-workspace.yaml
├── package.json             # Root workspace package.json
├── CLAUDE.md                # Root project guidance
└── strat-summit.code-workspace
```

## CLAUDE.md Content

### Root CLAUDE.md

Project overview and cross-cutting concerns:

- Project name, purpose, client context (Strathcona Summit Solutions)
- Business pillars (PM/Cleaning, Renovations, Laundromat)
- Tech stack summary (Go + Next.js + Railway services)
- Monorepo navigation guide
- Links to spec docs in `docs/`
- Deployment targets (Vercel for frontend, Railway for backend)
- Environment variable patterns
- Git commit conventions

### backend/CLAUDE.md

Go-specific guidance:

- Go version (1.22), module path
- Package structure explanation (`internal/` layout)
- Key dependencies (chi, pgx, minio-go, golang-jwt, godotenv)
- Database patterns (pgx, repository pattern)
- Error handling conventions
- API response formats
- Integration patterns (how to add new integrations)
- Testing approach

### frontend/CLAUDE.md

Next.js-specific guidance:

- Next.js 16 App Router patterns
- Portal structure (`(admin)`, `(staff)`, `(owner)`, `(client)`, `(subtrade)`)
- Component organization
- Server Actions vs API routes
- Auth flow (JWT from backend)
- Styling (Tailwind v4 conventions, brand colors)
- State management approach

## Workspace Configuration

### Root package.json

```json
{
  "name": "strat-summit",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter frontend dev",
    "build": "pnpm --filter frontend build",
    "lint": "pnpm --filter frontend lint"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "frontend"
```

Go backend is outside pnpm workspace — managed separately with `go mod`.

### Go Module (backend/go.mod)

```go
module github.com/ubiship/strat-summit/backend

go 1.22

require (
    github.com/go-chi/chi/v5 v5.0.12
    github.com/jackc/pgx/v5 v5.5.5
    github.com/minio/minio-go/v7 v7.0.70
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/joho/godotenv v1.5.1
)
```

### VS Code Workspace

```json
{
  "folders": [
    { "path": ".", "name": "root" },
    { "path": "backend", "name": "backend (Go)" },
    { "path": "frontend", "name": "frontend (Next.js)" }
  ],
  "settings": {
    "go.goroot": "",
    "typescript.tsdk": "frontend/node_modules/typescript/lib"
  }
}
```

## Migration Plan

### Files to Move

```
# Frontend files → frontend/
src/                    → frontend/src/
public/                 → frontend/public/
package.json            → frontend/package.json
next.config.mjs         → frontend/next.config.mjs
tsconfig.json           → frontend/tsconfig.json
tailwind.config.ts      → frontend/tailwind.config.ts
postcss.config.mjs      → frontend/postcss.config.mjs
.env.example            → frontend/.env.example
mdx-components.tsx      → frontend/mdx-components.tsx

# Docs → docs/
00_PROJECT.md           → docs/00_PROJECT.md
01_DATA_MODEL.md        → docs/01_DATA_MODEL.md
02_PAYOUT_ENGINE.md     → docs/02_PAYOUT_ENGINE.md
07_INTEGRATIONS.md      → docs/07_INTEGRATIONS.md
08_INFRASTRUCTURE.md    → docs/08_INFRASTRUCTURE.md
CHANGELOG.md            → docs/CHANGELOG.md
```

### Files to Delete

```
.next/                  # Build artifacts, will regenerate
node_modules/           # Dependencies, will reinstall
```

## Go Scaffold Contents

Each package gets a minimal starter file:

| File | Contents |
|------|----------|
| `cmd/server/main.go` | Main entrypoint, chi router setup, graceful shutdown |
| `internal/config/config.go` | Env loading with godotenv |
| `internal/domain/entities.go` | Empty, placeholder for entity structs |
| `internal/auth/jwt.go` | JWT types and interface stubs |
| `internal/handler/health.go` | `/health` endpoint |
| `internal/repository/repository.go` | Repository interface |
| `internal/service/service.go` | Service layer interface |
| `internal/integrations/*` | Empty packages for each integration |
| `migrations/.keep` | Empty dir for golang-migrate |
| `templates/pdf/.keep` | Empty dir for Gotenberg templates |

## Success Criteria

1. `pnpm install` works from root
2. `pnpm dev` starts the Next.js frontend
3. `cd backend && go build ./...` compiles without errors
4. VS Code workspace opens with correct language support per folder
5. All existing marketing site functionality preserved
6. CLAUDE.md files provide useful context for AI-assisted development
