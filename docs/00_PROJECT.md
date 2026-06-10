    # Strathcona Summit — Project Spec

> **Last Updated:** June 2025

## Current Status Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0 — Foundation | Complete | Backend scaffold, auth, database, Vercel/Railway deploys |
| Phase 1 — PM Core | In Progress | Core APIs done, Chatwoot integration done, admin dashboard scaffold ready |
| Phase 2 — Payout Engine | Not Started | Schema exists |
| Phase 3 — Renovations | Not Started | Schema exists |
| Phase 4 — Intelligence | Not Started | — |

**Recent Milestones:**
- Chatwoot webhook handler with HMAC verification
- Contact sync service (bidirectional)
- Pending contact approval workflow
- Monorepo restructure (apps/web, apps/admin, packages/*)
- Strathcona branding applied to marketing site

---

## Overview

Custom operational platform for Strathcona Summit Solutions (Joel & Amanda),
a Vancouver Island-based company operating across three business pillars:
property management & cleaning, renovations & construction, and laundromat (future).

Built and managed by UbiShip Limited. No upfront cost. Monthly subscription model.

---

## Tech Stack

| Layer | Technology | Host |
|---|---|---|
| Backend | Go 1.22 (chi router, pgx) | Railway |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 | Vercel |
| Monorepo | pnpm workspaces + Turbo | — |
| Database | PostgreSQL 15 (self-hosted) | Railway |
| Auth | Custom JWT (Go — bcrypt + refresh tokens) | Backend service |
| File Storage | MinIO (S3-compatible, self-hosted) | Railway |
| Notifications | Novu (self-hosted) | Railway |
| PDF Generation | Gotenberg (self-hosted) | Railway |
| Scheduling | Cal.com (self-hosted) | Railway |
| Cache / Queue | Redis 7 (shared) | Railway |
| Inbox / Comms | Chatwoot (self-hosted) | Railway |
| SMS provider | Twilio (via Novu) | External |
| Email provider | Resend (via Novu) | External |
| Accounting | QuickBooks Online API | External |
| Bookings (iCal) | Airbnb / VRBO iCal polling | External |
| Digital Signing | Dropbox Sign (embedded) | External |
| Voice AI | VAPI | External |
| AI Assistant | Archivus (UbiShip) | UbiShip infra |
| Payments | E-transfer (now) / Stripe (future) | — |

---

## Repository Structure

```
strat-summit/
├── backend/                    # Go API service → Railway
│   ├── cmd/
│   │   └── server/             # main.go entrypoint
│   ├── internal/
│   │   ├── auth/               # JWT generation, validation, middleware
│   │   ├── config/             # Environment variable loading
│   │   ├── domain/             # Entity structs, enums
│   │   ├── handler/            # HTTP handlers (chi router)
│   │   ├── service/            # Business logic layer
│   │   ├── repository/         # Data access layer (pgx)
│   │   ├── jobs/               # Background jobs & cron scheduler
│   │   └── integrations/       # External service clients
│   │       ├── chatwoot/       # Chatwoot API client (✓ implemented)
│   │       ├── novu/           # Novu notification client (✓ implemented)
│   │       ├── minio/          # MinIO storage client (stub)
│   │       ├── gotenberg/      # PDF generation client (stub)
│   │       └── qbo/            # QuickBooks Online client (stub)
│   ├── migrations/             # golang-migrate SQL files (26 migrations)
│   └── Dockerfile
├── apps/
│   ├── web/                    # Next.js marketing site + public portal → Vercel
│   │   ├── src/app/
│   │   │   ├── page.tsx        # Homepage (Strathcona branding)
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── property-management/
│   │   │   ├── renovations/
│   │   │   ├── blog/
│   │   │   └── work/           # Case studies
│   │   └── src/components/
│   └── admin/                  # Next.js admin dashboard → Vercel
│       └── src/app/
│           ├── dashboard/      # Main dashboard
│           ├── bookings/       # Booking management (scaffold)
│           ├── contacts/       # Contact management (scaffold)
│           ├── jobs/           # Cleaning job management (scaffold)
│           ├── properties/     # Property management (scaffold)
│           └── login/          # Authentication
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── types/                  # Shared TypeScript types
│   ├── tailwind-config/        # Shared Tailwind theme (Strathcona brand)
│   └── typescript-config/      # Shared TS configuration
├── turbo.json                  # Turbo build configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── docs/
    ├── 00_PROJECT.md           ← this file
    ├── 01_DATA_MODEL.md
    ├── 02_PAYOUT_ENGINE.md
    ├── 03_ROLES_ACCESS.md
    ├── 04_DOMAIN_PM.md
    ├── 05_DOMAIN_RENOVATIONS.md
    ├── 06_DOMAIN_AI.md
    ├── 07_INTEGRATIONS.md
    └── 08_INFRASTRUCTURE.md
```

---

## Business Pillars

| Pillar | Status | Priority |
|---|---|---|
| Property Management & Cleaning | Active — 1 property, scaling to ~5 by 2027 | P0 |
| Renovations & Construction | Active — seasonal, summer-heavy | P1 |
| Laundromat | Pre-launch — data model stub only | P3 |

---

## Service Tiers (PM & Cleaning)

Three distinct service agreements, each with different platform scope:

| Tier | Name | Description | Platform Scope |
|---|---|---|---|
| 1 | Basic Cleaning | Client sends dates, SS cleans, no further involvement | CleaningJob dispatch only |
| 2 | Cleaning + Caretaking | Maintenance checks, restocking, client relations. Owner handles platform/marketing | Dispatch + service tracking, no payout |
| 3 | Full Property Management | SS handles everything. Monthly owner payout statement | Full payout engine + owner portal |

> **Data model note:** `Property.tier` and `ServiceAgreement.tier` must be set at onboarding.
> Payout engine only activates for Tier 3. Direct booking intake only relevant for Tier 2/3.

---

## Build Phases

### Phase 0 — Foundation ✓ COMPLETE
- ✓ PostgreSQL on Railway — schema, migrations via golang-migrate (26 migrations)
- ✓ Go backend scaffold (chi router, pgx, env config)
- ✓ Custom JWT auth — login, refresh, logout endpoints
- ✓ Next.js monorepo shell (apps/web + apps/admin)
- ✓ Role-based access control (7 roles)
- ✓ Railway + Vercel deploy pipeline
- ○ MinIO deployment + bucket creation (stub only)
- ○ QBO OAuth connection (stub only)
- ○ CI via GitHub Actions (not configured)

### Phase 1 — PM Core (IN PROGRESS)
- ✓ Property CRUD + tier assignment
- ✓ Direct booking creation → Booking record
- ✓ CleaningJob auto-creation on booking confirmation
- ✓ Staff timesheet (clock in/out per job)
- ✓ **Chatwoot integration** — webhook handler, contact sync, conversation linking
- ✓ **Chatwoot webhook handler** — `POST /webhooks/chatwoot` with HMAC verification
- ✓ **Pending contact workflow** — contacts from Chatwoot queued for admin review
- ✓ **Novu client** — wired into service layer (triggers stubbed)
- ✓ **Admin dashboard scaffold** — layout, routing, auth context ready
- ○ iCal sync (Airbnb, VRBO) — schema ready, polling job not implemented
- ○ Mobile checklist — not implemented
- ○ Photo upload (MinIO) — not implemented
- ○ Hot tub photo required flag — schema ready
- ○ VAPI → Chatwoot bridge — not implemented

### Phase 2 — Payout Engine (NOT STARTED)
- ○ Full payout calculation (see `02_PAYOUT_ENGINE.md`)
- ✓ Breakdown tab + Owner Payout tab data models (schema exists)
- ○ **Gotenberg deployment** — HTML template → PDF microservice
- ○ Owner statement PDF generation via Gotenberg
- ○ Statement delivery via Novu (email channel → Resend provider)
- ○ QBO sync for payout accounting records
- ○ Dropbox Sign for service agreements

### Phase 3 — Renovations Pipeline (NOT STARTED)
- ✓ Project entity defined (domain + schema)
- ○ Estimate builder (line items: materials + labour + margin)
- ○ Gotenberg PDF generation for estimates and contracts
- ○ Three contract templates (fixed, cost-plus, T&M) via Gotenberg
- ○ Change order workflow with Dropbox Sign
- ○ Project phase pipeline (Estimate → Booked → In Progress → Complete)
- ○ Subtrade portal
- ○ Milestone billing triggers → QBO invoice push
- ○ **Cal.com deployment** — self-hosted scheduling for renovation consultations
- ○ Cal.com booking widget embedded in renovation client portal

### Phase 4 — Intelligence Layer (NOT STARTED)
- ○ Unified KPI dashboard
- ○ AI receipt capture (photo → Vision API → QBO draft expense)
- ○ VAPI agent configuration and webhook handling
- ○ Archie (Archivus) integration
- ○ Automated report generation + Resend delivery
- ✓ Laundromat data model stub (schema exists)

---

## Key Architectural Decisions

### ADR-001: Go backend, not Node
Go chosen for Railway cost efficiency, low memory footprint, and strong
concurrency primitives for background jobs (iCal polling, report generation,
QBO sync). Backend is a single binary. No serverless functions.

### ADR-002: Self-hosted PostgreSQL on Railway, not Supabase
Supabase is convenient but creates lock-in and abstracts away control we'll
eventually need. Self-hosted Postgres on Railway gives full access, no
per-row pricing, no Supabase-specific extensions required, and straightforward
migration path to Hetzner dedicated if volume justifies it. golang-migrate
for schema versioning.

### ADR-003: Custom JWT auth, not Supabase Auth or Zitadel
Closed platform — all user accounts provisioned by UbiShip. No public signup,
no OAuth providers needed. Custom JWT in Go (bcrypt passwords, 15-min access
tokens, 30-day rotating refresh tokens stored hashed in DB) is simpler than
running a separate auth service. If this becomes a multi-tenant SaaS product,
Zitadel is the migration target.

### ADR-004: MinIO for file storage, not Supabase Storage
S3-compatible API means the Go SDK (`minio-go/v7`) is identical to AWS SDK.
Self-hosted on Railway. Pre-signed URLs for time-limited client access (15-min
expiry). Buckets: `photos`, `statements`, `contracts`, `documents`.
Migration to Cloudflare R2 or AWS S3 is trivial — same API surface.

### ADR-005: SSE for realtime, not WebSockets
Platform use cases (job status updates, new booking alerts, checklist
completions) are server-to-client only. Server-Sent Events over HTTP/2 are
sufficient, require no extra service, and are natively supported in Next.js.
Centrifugo is the upgrade path if bidirectional realtime is needed.

### ADR-006: iCal over Airbnb API
Airbnb direct API requires partnership approval (months). iCal polling
is available immediately, reliable, and read-only. Revisit at 10+ properties.

### ADR-007: E-transfer over Stripe (Phase 1)
Current client base comfortable with e-transfer. Stripe added in Phase 3+.

### ADR-008: Dropbox Sign over DocuSign
Embedded signing API. Lower cost at current volume. Swappable if needed.

### ADR-009: Three-tier service model in data model from day one
`Property.tier` required at creation even with only Tier 3 active.
Prevents schema migration pain at Tier 1/2 onboarding.

---

## Environment Variables (backend)

```
# Database
DATABASE_URL=postgres://user:pass@railway-host:5432/strathcona
DATABASE_MAX_CONNS=25
DATABASE_MIN_CONNS=5

# Auth
JWT_SECRET=
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=30

# MinIO
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_USE_SSL=true
MINIO_BUCKET_PHOTOS=photos
MINIO_BUCKET_STATEMENTS=statements
MINIO_BUCKET_CONTRACTS=contracts
MINIO_BUCKET_DOCUMENTS=documents
MINIO_PRESIGN_TTL_MIN=15

# QBO
QBO_CLIENT_ID=
QBO_CLIENT_SECRET=
QBO_REDIRECT_URI=

# Comms
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
RESEND_API_KEY=

# Chatwoot
CHATWOOT_BASE_URL=
CHATWOOT_API_ACCESS_TOKEN=
CHATWOOT_WEBHOOK_SECRET=
CHATWOOT_ACCOUNT_ID=
CHATWOOT_INBOX_ID_SMS=
CHATWOOT_INBOX_ID_EMAIL=

# Signing
DROPBOX_SIGN_API_KEY=

# AI
VAPI_API_KEY=
ARCHIVUS_API_KEY=

# Redis (shared by Novu + Cal.com)
REDIS_URL=redis://railway-redis:6379

# Novu
NOVU_API_KEY=
NOVU_APP_ID=                          # for frontend in-app component
NOVU_API_URL=http://novu:3000          # internal Railway URL

# Gotenberg
GOTENBERG_URL=http://gotenberg:3000    # internal Railway URL

# Cal.com
CAL_API_KEY=
CAL_WEBHOOK_SECRET=
CAL_BASE_URL=                          # public Cal.com URL
CAL_EVENT_TYPE_CONSULTATION=           # event type ID
CAL_EVENT_TYPE_WALKTHROUGH=            # event type ID
STATEMENT_CRON=0 9 1 * *
REPORT_CRON_WEEKLY=0 7 * * 1
REPORT_CRON_MONTHLY=0 7 1 * *
```

---

## Contacts

| Person | Role | Contact |
|---|---|---|
| Joel | Owner, growth | — |
| Amanda | Owner, day-to-day operations | — |
| Bookkeeper | QBO reconciliation | — |
| Max | UbiShip — lead developer | hello@ubiship.io |
| Katharine | UbiShip — PM | — |

---

## Open Questions

- [ ] VAPI: existing number or new dedicated line?
- [ ] VAPI: top 5 call reasons, transfer policy, after-hours policy
- [ ] Archie: which 5 data questions most frequently asked?
- [ ] Reports: delivery schedule, recipients, key metrics
- [ ] QBO: bookkeeper sign-off on integration approach before wiring up
- [ ] Cleaning staff pay: confirm hourly rate(s), transition timeline to per-job
- [ ] Direct booking: confirm intake method (platform form vs. text/email forwarding)
