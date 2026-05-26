# 08 — Infrastructure

All services self-hosted on Railway. No Supabase. No managed auth.
Full control, straightforward migration path to Hetzner if scale demands it.

---

## Railway Services

| Service | Image / Source | RAM | Notes |
|---|---|---|---|
| `backend` | Go (Dockerfile) | 512MB | Main API + cron jobs |
| `frontend` | Vercel (separate) | — | Next.js on Vercel edge |
| `postgres` | `postgres:15-alpine` | 1GB | Primary database (shared schemas) |
| `redis` | `redis:7-alpine` | 256MB | Shared by Novu + Cal.com |
| `minio` | `minio/minio:latest` | 512MB | Object storage |
| `gotenberg` | `gotenberg/gotenberg:8` | 256MB | PDF generation microservice |
| `novu` | `ghcr.io/novuhq/novu:latest` | 512MB | Notification hub |
| `novu-worker` | `ghcr.io/novuhq/novu-worker:latest` | 256MB | Novu background worker |
| `cal` | `calcom/cal.com:latest` | 512MB | Self-hosted scheduling |
| `chatwoot` | `chatwoot/chatwoot:latest` | 1GB | Inbox service |
| `chatwoot-sidekiq` | `chatwoot/chatwoot:latest` | 512MB | Chatwoot background jobs |
| `chatwoot-postgres` | `postgres:15-alpine` | 512MB | Chatwoot's own DB |
| `chatwoot-redis` | `redis:7-alpine` | 128MB | Chatwoot job queue (separate from shared Redis) |
| `uptime-kuma` | `louislam/uptime-kuma:latest` | 128MB | Uptime monitoring |

**Estimated Railway cost:** ~$60–80/month at current scale.

> **Postgres schemas:** Novu and Cal.com each get their own schema on the
> main `postgres` service — `novu` and `calcom`. Avoids running three
> separate Postgres instances. Chatwoot keeps its own instance (incompatible
> migration tooling).

---

## PostgreSQL

Self-hosted. Single instance. No read replicas at this scale.

```
Image:    postgres:15-alpine
Volume:   /var/lib/postgresql/data  (Railway persistent volume)
Port:     5432 (internal only)
```

**Configuration:**
```sql
-- postgresql.conf tuning for Railway 1GB instance
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

**Connection pooling:** PgBouncer not needed at current scale.
Go backend uses `pgxpool` with `max_conns=25`, `min_conns=5`.

**Migrations:** `golang-migrate/migrate` — SQL files in `backend/migrations/`.
Run on deploy via Railway start command:
```
migrate -path /app/migrations -database $DATABASE_URL up && ./server
```

**Backup:** Railway volume snapshots daily. For production safety, add
`pg_dump` cron job shipping to MinIO `backups/` bucket weekly.

---

## MinIO

S3-compatible object storage. Self-hosted, full control, trivial migration
path to Cloudflare R2 or AWS S3 (identical API surface).

```
Image:    minio/minio:latest
Volume:   /data  (Railway persistent volume)
Port:     9000 (API), 9001 (console — internal only)
Command:  minio server /data --console-address ":9001"
```

**Buckets:**

| Bucket | Contents | Access |
|---|---|---|
| `photos` | Cleaning job photos, project progress photos | Presigned URL (15 min) |
| `statements` | Owner statement PDFs (client-facing + internal) | Presigned URL (15 min) |
| `contracts` | Signed agreements, estimates, change orders | Presigned URL (15 min) |
| `documents` | SOPs, insurance docs, misc | Presigned URL (15 min) |
| `backups` | pg_dump exports | Internal only |
| `receipts` | Expense receipt photos | Presigned URL (15 min) |

**Go client:**
```go
// backend/internal/integrations/minio/client.go

import "github.com/minio/minio-go/v7"

type Client struct {
    mc     *minio.Client
    config Config
}

type Config struct {
    Endpoint        string
    AccessKey       string
    SecretKey       string
    UseSSL          bool
    PresignTTLMin   int
}

func (c *Client) PutObject(ctx context.Context, bucket, key string, data io.Reader, size int64, contentType string) error
func (c *Client) PresignedGetURL(ctx context.Context, bucket, key string) (string, error)
func (c *Client) DeleteObject(ctx context.Context, bucket, key string) error
func (c *Client) ObjectExists(ctx context.Context, bucket, key string) (bool, error)
```

**Storage key conventions:**
```
photos/    {property_id}/{job_id}/{uuid}.jpg
receipts/  {contact_id}/{year}/{month}/{uuid}.jpg
statements/{property_id}/{year}/{month}/owner_{uuid}.pdf
statements/{property_id}/{year}/{month}/breakdown_{uuid}.pdf
contracts/ {project_id}/{type}_{uuid}.pdf
documents/ {contact_id}/{uuid}.pdf
backups/   {year}/{month}/{date}_dump.sql.gz
```

---

## Auth

No separate auth service. Custom implementation in Go.

### Token Flow

```
POST /auth/login
  body: { email, password }
  → verify password (bcrypt, cost=12)
  → generate access_token (JWT, 15 min)
  → generate refresh_token (random 32 bytes, hex-encoded)
  → store bcrypt hash of refresh_token + expiry in users table
  → return { access_token, refresh_token, expires_in: 900 }

POST /auth/refresh
  body: { refresh_token }
  → find user by token hash match
  → verify not expired, user active
  → rotate: generate new pair, invalidate old refresh_token
  → return { access_token, refresh_token, expires_in: 900 }

POST /auth/logout
  body: { refresh_token }
  → clear refresh_token_hash from DB
  → access token expires naturally (15 min max exposure)
```

### JWT Structure

```go
type Claims struct {
    UserID    string `json:"sub"`
    Role      string `json:"role"`
    ContactID string `json:"contact_id"`
    jwt.RegisteredClaims
}
```

Signed with `HS256` using `JWT_SECRET`. Verified on every request in middleware.

### Middleware

```go
// backend/internal/auth/middleware.go

func Authenticate(secret []byte) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            raw := extractBearer(r.Header.Get("Authorization"))
            if raw == "" {
                respondUnauthorized(w)
                return
            }
            claims, err := validateJWT(raw, secret)
            if err != nil {
                respondUnauthorized(w)
                return
            }
            ctx := context.WithValue(r.Context(), CtxKeyAuth, &AuthContext{
                UserID:    uuid.MustParse(claims.UserID),
                ContactID: uuid.MustParse(claims.ContactID),
                Role:      UserRole(claims.Role),
            })
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

func RequireRole(roles ...UserRole) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            auth := AuthFromContext(r.Context())
            for _, role := range roles {
                if auth.Role == role {
                    next.ServeHTTP(w, r)
                    return
                }
            }
            respondForbidden(w)
        })
    }
}
```

### Password Reset

No email-based self-service reset. UbiShip admin resets passwords manually
via admin CLI command:

```bash
./server admin reset-password --email=amanda@strathcona.ca
# generates temp password, logs to stdout, user must change on first login
```

---

## Realtime (In-App Notifications via Novu)

In-app notifications are handled by Novu's in-app channel — not a custom
SSE hub. Novu provides a React component that connects to its own WebSocket
server and renders a notification bell + feed.

This replaces the custom SSE implementation entirely. See Novu section in
`07_INTEGRATIONS.md` for the full spec.

```tsx
// frontend/components/NotificationBell.tsx
import { NovuProvider, PopoverNotificationCenter, NotificationBell } from '@novu/notification-center'

export function AppNotifications({ userId }: { userId: string }) {
  return (
    <NovuProvider
      subscriberId={userId}
      applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID}
      backendUrl={process.env.NEXT_PUBLIC_NOVU_API_URL}
    >
      <PopoverNotificationCenter>
        {({ unseenCount }) => <NotificationBell unseenCount={unseenCount} />}
      </PopoverNotificationCenter>
    </NovuProvider>
  )
}
```

---

## Railway Deployment

### Services wired together

```
backend    → postgres (internal Railway network)
backend    → minio (internal Railway network)
backend    → chatwoot-postgres (internal Railway network, read-only for sync)
chatwoot   → chatwoot-postgres
chatwoot   → chatwoot-redis
frontend   → backend (HTTPS, public)
```

Internal services communicate via Railway's private network (`*.railway.internal`).
Only `backend` and `chatwoot` are publicly exposed.

### Health checks

```
GET /health → 200 { "status": "ok", "db": "ok", "minio": "ok" }
```

Railway uses this for zero-downtime deploys.

### Dockerfile (backend)

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /server
COPY --from=builder /app/migrations /migrations
EXPOSE 8080
CMD ["/server"]
```

---

## Monitoring

**Uptime Kuma** — lightweight self-hosted uptime monitor. Deploy as a Railway
service. Monitors:
- Backend `/health` endpoint
- MinIO console ping
- Chatwoot health endpoint

Alerts via Telegram or email on downtime.

```
Image:   louislam/uptime-kuma:latest
Volume:  /app/data
Port:    3001 (internal only, access via Railway public URL)
```

**Logging:** Structured JSON logs from Go backend (`log/slog`).
Railway captures stdout — searchable in Railway dashboard.
No external log aggregation needed at this scale.

**Error tracking:** Sentry Go SDK.
```go
import "github.com/getsentry/sentry-go"
sentry.Init(sentry.ClientOptions{Dsn: os.Getenv("SENTRY_DSN")})
```
Free tier covers current volume. Captures panics, errors, and slow transactions.

---

## Migration Path to Hetzner

When Railway costs or limits become a constraint (likely at 10+ properties
or if Chatwoot/MinIO storage grows significantly):

1. Provision Hetzner CX32 (~€13/month, 8GB RAM, 80GB SSD)
2. Deploy Postgres, MinIO, Chatwoot, Redis via Docker Compose
3. Update Railway backend env vars to point to Hetzner
4. Go backend remains on Railway (cheap, zero-ops deployment)
5. Frontend remains on Vercel

**Nothing in the codebase changes.** Only env vars. That's the point.
