# Chatwoot Integration Design

## Overview

Self-hosted Chatwoot on Railway as the unified client-facing inbox. Bidirectional sync with Go backend for contact management and conversation linking to Bookings and Projects.

**Phase:** P1 (Active)

**Separation of concerns:**
- **Chatwoot:** Conversational inbox (SMS, email, live chat) for owners, renovation clients, guests
- **Novu:** Transactional notifications (job assigned, booking confirmed, statement generated)
- **Twilio direct:** Staff dispatch SMS (cleaners only)

---

## Part 1: Railway Deployment

### Services

| Service | Image | Purpose |
|---------|-------|---------|
| `chatwoot-web` | `chatwoot/chatwoot:latest` | Rails app (port 3000) |
| `chatwoot-sidekiq` | `chatwoot/chatwoot:latest` | Background jobs |
| `chatwoot-postgres` | PostgreSQL 15 | Dedicated database (not shared) |
| `chatwoot-redis` | Redis 7 | Sidekiq + Action Cable |

### Environment Variables

```bash
# Rails
SECRET_KEY_BASE=<generated>
FRONTEND_URL=https://chatwoot.strathconasummit.com
RAILS_ENV=production
DEFAULT_LOCALE=en

# Database
DATABASE_URL=postgres://chatwoot:...@chatwoot-postgres:5432/chatwoot

# Redis
REDIS_URL=redis://chatwoot-redis:6379

# Twilio (SMS channel)
TWILIO_ACCOUNT_SID=<twilio_sid>
TWILIO_AUTH_TOKEN=<twilio_token>

# Email (SMTP)
SMTP_ADDRESS=smtp.resend.com
SMTP_PORT=587
SMTP_USERNAME=resend
SMTP_PASSWORD=<resend_api_key>
SMTP_DOMAIN=strathconasummit.com
MAILER_SENDER_EMAIL=hello@strathconasummit.com
```

### Channels to Configure

1. **SMS Inbox** - Twilio business number (separate from staff dispatch number)
2. **Email Inbox** - hello@strathconasummit.com forwarded to Chatwoot
3. **Website Live Chat** - Embedded widget on Strathcona Summit website

---

## Part 2: Go Client

### Package

`backend/internal/integrations/chatwoot`

### Config

```go
type Config struct {
    BaseURL       string // https://chatwoot.strathconasummit.com
    APIToken      string // Agent API token from Chatwoot settings
    AccountID     int    // Chatwoot account ID
    WebhookSecret string // HMAC signing secret for webhook verification
}
```

### Types

```go
type Contact struct {
    ID         int64  `json:"id"`
    Name       string `json:"name"`
    Email      string `json:"email,omitempty"`
    Phone      string `json:"phone_number,omitempty"`
    ExternalID string `json:"identifier"` // our contact UUID
}

type Conversation struct {
    ID        int64  `json:"id"`
    InboxID   int    `json:"inbox_id"`
    ContactID int64  `json:"contact_id"`
    Status    string `json:"status"` // "open", "resolved", "pending"
}

type Message struct {
    Content     string `json:"content"`
    MessageType string `json:"message_type"` // "outgoing", "incoming"
    Private     bool   `json:"private"`      // true for internal notes
}
```

### Methods

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `CreateContact(ctx, Contact) (*Contact, error)` | `POST /api/v1/accounts/{id}/contacts` | Create new contact |
| `GetContactByPhone(ctx, phone) (*Contact, error)` | `GET /api/v1/accounts/{id}/contacts/filter` | Find contact by phone |
| `UpsertContact(ctx, Contact) (*Contact, error)` | `POST /api/v1/accounts/{id}/contacts` | Create or update by identifier |
| `SendMessage(ctx, conversationID, Message) error` | `POST /api/v1/accounts/{id}/conversations/{cid}/messages` | Send message |
| `CreateConversation(ctx, contactID, inboxID) (*Conversation, error)` | `POST /api/v1/accounts/{id}/conversations` | Start conversation |
| `ResolveConversation(ctx, conversationID) error` | `POST /api/v1/accounts/{id}/conversations/{cid}/toggle_status` | Mark resolved |

### HTTP Client

- 30-second timeout
- Authorization header: `api_access_token {token}`
- Content-Type: `application/json`

---

## Part 3: Webhook Handler

### Endpoint

`POST /webhooks/chatwoot`

### Security

HMAC-SHA256 signature verification:
- Header: `X-Chatwoot-Signature`
- Secret: `Config.WebhookSecret`

### Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `contact_created` | `HandleContactCreated` | Match or queue for review |
| `conversation_created` | `HandleConversationCreated` | Link to Booking/Project |
| `message_created` | `HandleMessageCreated` | Log to audit table |
| `conversation_resolved` | `HandleConversationResolved` | Log for analytics |

### Payload Structure

```go
type WebhookPayload struct {
    Event        string        `json:"event"`
    AccountID    int           `json:"account"`
    Conversation *Conversation `json:"conversation,omitempty"`
    Contact      *Contact      `json:"contact,omitempty"`
    Message      *Message      `json:"message,omitempty"`
}
```

### Audit Logging

All webhook events logged to `chatwoot_events` table asynchronously before processing.

Uses existing `ChatwootEvent` domain entity:
```go
type ChatwootEvent struct {
    ID               uuid.UUID
    EventType        string
    ChatwootID       int64
    Payload          json.RawMessage
    ProcessedAt      *time.Time
    Error            *string
    CreatedAt        time.Time
}
```

---

## Part 4: Contact Sync

### Outbound (Platform to Chatwoot)

**Trigger:** When contact created in our platform via `CreateContact` service method

**Flow:**
1. Build Chatwoot contact with `identifier` = our contact UUID
2. Call `chatwoot.UpsertContact()`
3. Store returned Chatwoot contact ID on our contact record

**Code location:** Add to existing `service.CreateContact()` (similar to Novu sync)

### Inbound (Chatwoot to Platform)

**Trigger:** `contact_created` webhook event

**Flow:**
1. Try match by phone number (`repo.FindContactByPhone`)
2. If no match, try match by email (`repo.FindContactByEmail`)
3. If matched: Store Chatwoot ID on existing contact
4. If no match: Create `PendingContact` for admin review

### PendingContact Entity

New domain entity for unmatched contacts requiring admin review:

```go
type PendingContact struct {
    ID                uuid.UUID
    ChatwootContactID int64
    Name              string
    Email             *string
    Phone             *string
    Source            string    // "chatwoot"
    CreatedAt         time.Time
    ReviewedAt        *time.Time
    ReviewedBy        *uuid.UUID
    Action            string    // "approved", "rejected", "merged"
    MergedWithID      *uuid.UUID
}
```

### Database Migration

```sql
CREATE TABLE pending_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatwoot_contact_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'chatwoot',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    action TEXT, -- 'approved', 'rejected', 'merged'
    merged_with_id UUID REFERENCES contacts(id)
);

CREATE INDEX idx_pending_contacts_reviewed ON pending_contacts(reviewed_at) WHERE reviewed_at IS NULL;
```

---

## Part 5: Conversation Linking

### Trigger

`conversation_created` webhook event

### Flow

1. Find our contact by Chatwoot contact ID
2. Based on contact role:
   - **PMOwner/Guest:** Find open booking on owner's properties → link conversation
   - **RenovationClient:** Find open project → link conversation
3. Store conversation ID on Booking or Project

### Repository Methods

```go
// Contact lookup
FindContactByChatwootID(ctx, chatwootID int64) (*Contact, error)

// Booking linking
FindOpenBookingByOwner(ctx, ownerID uuid.UUID) (*Booking, error)
SetBookingChatwootConversation(ctx, bookingID uuid.UUID, conversationID int64) error

// Project linking
FindOpenProjectByClient(ctx, clientID uuid.UUID) (*Project, error)
SetProjectChatwootConversation(ctx, projectID uuid.UUID, conversationID int64) error
```

### Resolution Handling

When `conversation_resolved` webhook received:
- Log event to `chatwoot_events` for analytics
- No automatic status changes on Booking/Project

---

## Deferred Items

| Item | Phase | Notes |
|------|-------|-------|
| VAPI to Chatwoot bridge | P4 | Push call transcripts as private notes |
| Chatwoot Captain AI | P4+ | Tier-1 automated responses |

---

## File Structure

```
backend/
├── internal/
│   ├── integrations/
│   │   └── chatwoot/
│   │       └── client.go      # Full implementation (currently stub)
│   ├── handler/
│   │   └── chatwoot_webhook.go # New webhook handler
│   ├── service/
│   │   └── chatwoot_sync.go   # New sync service
│   ├── repository/
│   │   ├── contact.go         # Add Chatwoot-related queries
│   │   ├── booking.go         # Add conversation linking
│   │   ├── project.go         # Add conversation linking
│   │   └── pending_contact.go # New repository
│   └── domain/
│       └── entities.go        # Add PendingContact entity
└── migrations/
    └── 000006_pending_contacts.up.sql
```

---

## Testing Strategy

1. **Unit tests:** Client methods with HTTP mocks
2. **Integration tests:** Against running Chatwoot (dev instance)
3. **Webhook tests:** Signature verification, event routing
4. **E2E tests:** Full contact sync flow

---

## Dependencies

- Chatwoot deployed on Railway (Part 1 must complete first)
- Twilio account configured for SMS channel
- SMTP configured for email channel
