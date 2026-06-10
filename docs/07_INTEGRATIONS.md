# 07 — Integrations

All external integrations consumed by the Go backend unless noted.
Each integration has its own package under `backend/internal/integrations/`.

---

## Integration Index

| Integration | Package | Phase | Direction | Status |
|---|---|---|---|---|
| Chatwoot | `integrations/chatwoot` | P1 | Bidirectional | **Done** |
| Novu | `integrations/novu` | P1 | Outbound (trigger) | Partial |
| Gotenberg | `integrations/gotenberg` | P2 | Outbound (PDF) | Stub |
| Cal.com | `integrations/cal` | P3 | Inbound (webhooks) | Not started |
| QuickBooks Online | `integrations/qbo` | P0 | Bidirectional | Stub |
| Twilio | via Novu provider | P1 | Outbound (SMS) | Not started |
| Resend | via Novu provider | P1 | Outbound (email) | Not started |
| iCal | `integrations/ical` | P1 | Inbound (booking sync) | Schema only |
| Dropbox Sign | `integrations/dropboxsign` | P2 | Outbound (signing) | Not started |
| VAPI | `integrations/vapi` | P4 | Inbound (webhooks) | Not started |
| Archivus | `integrations/archivus` | P4 | Bidirectional | Not started |
| MinIO | `integrations/minio` | P0 | Outbound (storage) | Stub |
| Stripe | `integrations/stripe` | P3+ | Outbound (payments) | Not started |
| Square | `integrations/square` | P4 | Inbound (laundromat) | Not started |

---

## Chatwoot

> **Implementation Status: v0.1 COMPLETE**
>
> | Feature | Status |
> |---------|--------|
> | Webhook handler with HMAC | Done |
> | Contact sync (bidirectional) | Done |
> | Conversation linking (bookings/projects) | Done |
> | Pending contact workflow | Done |
> | Test coverage | Done |
> | VAPI → Chatwoot bridge | Not started |

**Role:** Unified client-facing inbox. All external communication from property
owners, renovation clients, direct booking inquiries, and guests flows through
Chatwoot. Twilio (staff dispatch) remains separate — Chatwoot owns everything
external-facing.

**Deployment:** Self-hosted on Railway as a separate service. Own PostgreSQL
instance (not shared with main DB — incompatible migration tooling). Redis for Sidekiq background jobs.

**Channels configured:**
- SMS via Twilio (business number — not the same Twilio number used for staff dispatch)
- Email (hello@strathcona... forwarded into Chatwoot inbox)
- Website live chat widget (embedded on SS website)

**Version:** v4.11.x (latest stable)

### Railway Deployment

```yaml
# chatwoot/docker-compose.yml
version: '3'
services:
  chatwoot:
    image: chatwoot/chatwoot:latest
    environment:
      - SECRET_KEY_BASE=${SECRET_KEY_BASE}
      - FRONTEND_URL=${CHATWOOT_BASE_URL}
      - DEFAULT_LOCALE=en
      - RAILS_ENV=production
      - DATABASE_URL=${CHATWOOT_DATABASE_URL}
      - REDIS_URL=${CHATWOOT_REDIS_URL}
      - SMTP_ADDRESS=${SMTP_ADDRESS}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    command: bundle exec rails s
  sidekiq:
    image: chatwoot/chatwoot:latest
    command: bundle exec sidekiq
    environment:
      - DATABASE_URL=${CHATWOOT_DATABASE_URL}
      - REDIS_URL=${CHATWOOT_REDIS_URL}
```

### Go Client

```go
// backend/internal/integrations/chatwoot/client.go

type Client struct {
    baseURL    string
    apiToken   string
    accountID  int
    httpClient *http.Client
}

type Contact struct {
    ID          int64  `json:"id"`
    Name        string `json:"name"`
    Email       string `json:"email"`
    Phone       string `json:"phone_number"`
    ExternalID  string `json:"identifier"` // our contact UUID
}

type Conversation struct {
    ID         int64  `json:"id"`
    InboxID    int    `json:"inbox_id"`
    ContactID  int64  `json:"meta.sender.id"`
    Status     string `json:"status"`
}

type Message struct {
    Content        string `json:"content"`
    MessageType    string `json:"message_type"` // "outgoing"
    Private        bool   `json:"private"`
}

func (c *Client) CreateContact(ctx context.Context, contact Contact) (*Contact, error)
func (c *Client) GetContactByPhone(ctx context.Context, phone string) (*Contact, error)
func (c *Client) UpsertContact(ctx context.Context, contact Contact) (*Contact, error)
func (c *Client) SendMessage(ctx context.Context, conversationID int64, msg Message) error
func (c *Client) CreateConversation(ctx context.Context, contactID int64, inboxID int) (*Conversation, error)
func (c *Client) ResolveConversation(ctx context.Context, conversationID int64) error
```

### Webhook Handler

Registered at: `POST /webhooks/chatwoot`

Chatwoot signs payloads with HMAC-SHA256. Verify before processing.

```go
// backend/internal/handler/chatwoot_webhook.go

type ChatwootWebhookPayload struct {
    EventType    string              `json:"event"`
    AccountID    int                 `json:"account"`
    Conversation *ChatwootConversation `json:"conversation,omitempty"`
    Contact      *ChatwootContact    `json:"contact,omitempty"`
    Message      *ChatwootMessage    `json:"message,omitempty"`
}

func (h *Handler) ChatwootWebhook(w http.ResponseWriter, r *http.Request) {
    // 1. Verify HMAC signature
    sig := r.Header.Get("X-Chatwoot-Signature")
    if !verifySignature(r.Body, sig, h.cfg.ChatwootWebhookSecret) {
        w.WriteHeader(http.StatusUnauthorized)
        return
    }

    // 2. Decode payload
    var payload ChatwootWebhookPayload
    json.NewDecoder(r.Body).Decode(&payload)

    // 3. Log to chatwoot_events (async, always — even if processing fails)
    go h.svc.LogChatwootEvent(context.Background(), payload)

    // 4. Route by event type
    switch payload.EventType {
    case "contact_created":
        h.svc.UpsertContactFromChatwoot(r.Context(), payload.Contact)
    case "conversation_created":
        h.svc.LinkConversation(r.Context(), payload.Conversation)
    case "message_created":
        h.svc.ProcessInboundMessage(r.Context(), payload)
    case "conversation_resolved":
        h.svc.HandleResolvedConversation(r.Context(), payload.Conversation)
    }

    w.WriteHeader(http.StatusOK)
}
```

### Contact Sync Service

```go
// backend/internal/service/chatwoot_sync.go

// Called whenever a Contact is created in our platform
func (s *Service) PushContactToChatwoot(ctx context.Context, contact *domain.Contact) error {
    cw := chatwoot.Contact{
        Name:       contact.FirstName + " " + contact.LastName,
        Email:      contact.Email,
        Phone:      contact.Phone,
        ExternalID: contact.ID.String(), // our UUID as identifier
    }
    result, err := s.chatwoot.UpsertContact(ctx, cw)
    if err != nil {
        return err
    }
    // Store Chatwoot ID back on our contact
    return s.repo.SetChatwootContactID(ctx, contact.ID, result.ID)
}

// Called on inbound contact_created webhook
func (s *Service) UpsertContactFromChatwoot(ctx context.Context, cw *chatwoot.Contact) error {
    // Try match by phone or email first
    existing, _ := s.repo.FindContactByPhone(ctx, cw.Phone)
    if existing != nil {
        return s.repo.SetChatwootContactID(ctx, existing.ID, cw.ID)
    }
    // Create new contact
    contact := &domain.Contact{
        FirstName:        parseFirstName(cw.Name),
        LastName:         parseLastName(cw.Name),
        Email:            cw.Email,
        Phone:            cw.Phone,
        Role:             domain.RoleUnknown, // assigned manually later
        ChatwootContactID: &cw.ID,
    }
    return s.repo.CreateContact(ctx, contact)
}
```

### Conversation Linking

When a conversation is created in Chatwoot, we attempt to link it to an
existing Booking or Project by matching the contact:

```go
func (s *Service) LinkConversation(ctx context.Context, conv *chatwoot.Conversation) error {
    // Find our contact by Chatwoot contact ID
    contact, err := s.repo.FindContactByChatwootID(ctx, conv.ContactID)
    if err != nil || contact == nil {
        return nil // no match yet, will resolve manually
    }

    // Check for open bookings associated with this contact's properties
    booking, _ := s.repo.FindOpenBookingByContact(ctx, contact.ID)
    if booking != nil {
        return s.repo.SetBookingChatwootConversation(ctx, booking.ID, conv.ID)
    }

    // Check for open projects
    project, _ := s.repo.FindOpenProjectByContact(ctx, contact.ID)
    if project != nil {
        return s.repo.SetProjectChatwootConversation(ctx, project.ID, conv.ID)
    }

    return nil
}
```

### VAPI → Chatwoot Bridge

After a VAPI call ends, the transcript and summary are pushed into the
contact's Chatwoot thread as a private internal note:

```go
func (s *Service) PushVAPICallToChatwoot(ctx context.Context, call *domain.VAPICall) error {
    if call.ContactID == nil {
        return nil // no contact match, skip
    }

    contact, err := s.repo.GetContact(ctx, *call.ContactID)
    if err != nil || contact.ChatwootContactID == nil {
        return nil
    }

    // Find or create a conversation for this contact
    convID, err := s.getOrCreateConversation(ctx, *contact.ChatwootContactID)
    if err != nil {
        return err
    }

    // Push as private note (internal — not visible to contact)
    note := fmt.Sprintf(
        "📞 **VAPI Call — %s**\n\n**Duration:** %ds\n**Outcome:** %s\n\n**Summary:**\n%s\n\n**Transcript:**\n%s",
        call.StartedAt.Format("Jan 2, 2006 3:04pm"),
        call.DurationSec,
        call.Outcome,
        call.Summary,
        call.Transcript,
    )

    return s.chatwoot.SendMessage(ctx, convID, chatwoot.Message{
        Content:     note,
        MessageType: "outgoing",
        Private:     true,
    })
}
```

### Outbound Messaging

When our platform needs to send a message to a contact (booking confirmation,
statement notification, etc.) we route through Chatwoot so the thread stays
unified:

```go
func (s *Service) SendToContact(ctx context.Context, contactID uuid.UUID, message string) error {
    contact, err := s.repo.GetContact(ctx, contactID)
    if err != nil {
        return err
    }
    if contact.ChatwootContactID == nil {
        // Fallback to Resend for email if not in Chatwoot yet
        return s.resend.SendPlain(ctx, contact.Email, message)
    }

    convID, err := s.getOrCreateConversation(ctx, *contact.ChatwootContactID)
    if err != nil {
        return err
    }

    return s.chatwoot.SendMessage(ctx, convID, chatwoot.Message{
        Content:     message,
        MessageType: "outgoing",
        Private:     false,
    })
}
```

### What Chatwoot Owns vs. What We Own

| Channel | Tool | Audience |
|---|---|---|
| Client-facing SMS | Chatwoot (via Twilio SMS channel) | Owners, renovation clients, guests |
| Client-facing email | Chatwoot (email channel) | Owners, renovation clients, guests |
| Website live chat | Chatwoot (chat widget) | New inquiries, direct bookings |
| Staff job dispatch SMS | Twilio direct (our backend) | Cleaning staff only |
| Transactional email (statements, contracts, reports) | Resend direct | Owners, bookkeeper |
| In-app notifications | Novu in-app channel | Staff, admin |

> **Rule:** If a human outside the company is initiating or receiving a
> conversational message, it goes through Chatwoot.
> If it's a system-generated document or an operational trigger, it goes
> through Resend or Twilio direct.

### Chatwoot Captain AI (Future)

Chatwoot's built-in AI agent (Captain) can handle tier-1 owner queries
automatically — booking status, statement queries, standard FAQs.

Configure in Phase 4+ once conversation volume justifies it. Requires
connecting Captain to a knowledge base built from property data and FAQs.
At that point, VAPI handles voice and Captain handles text — same contact
record, unified thread history.

---

*Additional integrations (QBO, Twilio, Resend, iCal, Dropbox Sign, VAPI,
Archivus) to be documented in subsequent sections.*

---

## Novu

> **Implementation Status: PARTIAL**
>
> | Feature | Status |
> |---------|--------|
> | Go client structure | Done |
> | Wired into service layer | Done |
> | Trigger methods | Stubbed (fire-and-forget) |
> | Frontend NovuProvider | Done |
> | NotificationBell component | Done |
> | Event templates | Not configured |

**Role:** Unified notification hub. Replaces all direct Twilio and Resend calls
from the Go backend. Single `Trigger()` call per event — Novu handles routing,
templating, provider delivery, retry, and delivery tracking. Also provides
in-app notification center (replaces custom SSE hub).

**Deployment:** Self-hosted on Railway. Uses main Postgres (`novu` schema) +
shared Redis.

**Providers configured:**
- SMS: Twilio
- Email: Resend
- In-app: Novu native (React component on frontend)

### Notification Events

| Event ID | Trigger | Channels | Recipients |
|---|---|---|---|
| `job.assigned` | CleaningJob created + staff assigned | SMS, In-app | Assigned cleaners |
| `job.reminder` | 2hrs before scheduled job | SMS | Assigned cleaners |
| `job.completed` | CleaningJob marked complete | In-app | Admin (Joel/Amanda) |
| `booking.confirmed` | New booking created | Email, In-app | Admin |
| `booking.direct.new` | Direct booking inquiry received | In-app | Admin |
| `statement.generated` | Owner statement PDF ready | Email | Property owner |
| `statement.sent` | Statement email delivered | In-app | Admin |
| `estimate.sent` | Renovation estimate sent to client | In-app | Admin |
| `estimate.accepted` | Client accepts estimate | Email, In-app | Admin |
| `contract.signed` | Dropbox Sign webhook fires | Email, In-app | Admin |
| `change_order.requested` | Change order created | Email | Renovation client |
| `change_order.approved` | Client approves change order | In-app | Admin |
| `payment.received` | E-transfer confirmed | In-app | Admin |
| `hot_tub.alert` | Hot tub flagged on job completion | SMS, In-app | Admin |
| `report.weekly` | Weekly digest generated | Email | Joel, Amanda |
| `report.monthly` | Monthly business report generated | Email | Joel, Amanda, Bookkeeper |
| `expense.pending` | New AI-captured receipt needs review | In-app | Admin, Bookkeeper |
| `cal.consultation.booked` | Cal.com webhook fires | Email, In-app | Admin |

### Go Client

```go
// backend/internal/integrations/novu/client.go

type Client struct {
    apiKey  string
    baseURL string
    http    *http.Client
}

type Subscriber struct {
    SubscriberID string `json:"subscriberId"` // our user UUID
    Email        string `json:"email"`
    Phone        string `json:"phone"`
    FirstName    string `json:"firstName"`
    LastName     string `json:"lastName"`
}

type TriggerPayload struct {
    To      Subscriber             `json:"to"`
    Payload map[string]interface{} `json:"payload"`
}

func (c *Client) Trigger(ctx context.Context, eventID string, p TriggerPayload) error
func (c *Client) UpsertSubscriber(ctx context.Context, s Subscriber) error
func (c *Client) BulkTrigger(ctx context.Context, eventID string, payloads []TriggerPayload) error
```

### Usage Pattern

```go
// Anywhere in service layer — one call regardless of channel
err := s.novu.Trigger(ctx, "job.assigned", novu.TriggerPayload{
    To: novu.Subscriber{
        SubscriberID: staffer.ID.String(),
        Phone:        staffer.Phone,
        FirstName:    staffer.FirstName,
    },
    Payload: map[string]interface{}{
        "property_name":    job.PropertyName,
        "scheduled_date":   job.ScheduledDate.Format("Mon Jan 2"),
        "scheduled_time":   job.ScheduledTime,
        "access_code":      job.Property.AccessCodes,
        "checklist_url":    fmt.Sprintf("%s/jobs/%s", appURL, job.ID),
    },
})
```

### Subscriber Sync

On `Contact` creation, upsert to Novu:

```go
func (s *Service) SyncContactToNovu(ctx context.Context, contact *domain.Contact) error {
    return s.novu.UpsertSubscriber(ctx, novu.Subscriber{
        SubscriberID: contact.ID.String(),
        Email:        contact.Email,
        Phone:        contact.Phone,
        FirstName:    contact.FirstName,
        LastName:     contact.LastName,
    })
}
```

### Data Model Addition

```sql
ALTER TABLE contacts ADD COLUMN novu_subscriber_id text
    GENERATED ALWAYS AS (id::text) STORED;
-- subscriber ID = our UUID, always. No sync needed.
```

### Frontend In-App Component

```tsx
// Configured at app root — _app.tsx or layout.tsx
<NovuProvider
  subscriberId={currentUser.id}
  applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID}
  backendUrl={process.env.NEXT_PUBLIC_NOVU_API_URL}
>
  {children}
</NovuProvider>
```

---

## Gotenberg

> **Implementation Status: NOT STARTED**
> - Client stub exists in `integrations/gotenberg/`
> - No templates created yet
> - PDF generation will be needed for Phase 2 (owner statements)

**Role:** PDF generation microservice. Accepts HTML templates + data, returns
PDF bytes. Replaces any Go PDF library for all document generation.

**Why HTML → PDF over a Go PDF lib:** Templates are maintainable HTML/CSS,
not imperative drawing code. Design changes don't require code changes.
Gotenberg handles fonts, tables, page breaks, headers/footers correctly.

**Deployment:** Stateless Docker container on Railway. No DB, no volume.
`gotenberg/gotenberg:8` — chromium-based, handles complex CSS.

```
Image:   gotenberg/gotenberg:8
Port:    3000 (internal only)
RAM:     256MB
Command: gotenberg --chromium-disable-javascript=true --chromium-allow-list=file:///
```

### Go Client

```go
// backend/internal/integrations/gotenberg/client.go

type Client struct {
    baseURL string
    http    *http.Client
}

type PDFRequest struct {
    HTML    string            // main HTML content
    Header  string            // optional header HTML
    Footer  string            // optional footer HTML
    Assets  map[string][]byte // filename → bytes (CSS, images)
    Options PDFOptions
}

type PDFOptions struct {
    MarginTop    float64 // inches
    MarginBottom float64
    MarginLeft   float64
    MarginRight  float64
    Format       string  // "A4" or "Letter"
    Landscape    bool
}

func (c *Client) HTMLtoPDF(ctx context.Context, req PDFRequest) ([]byte, error) {
    body := &bytes.Buffer{}
    w := multipart.NewWriter(body)

    // Write index.html
    fw, _ := w.CreateFormFile("files", "index.html")
    fw.Write([]byte(req.HTML))

    // Write any assets (CSS, logo)
    for name, data := range req.Assets {
        fw, _ = w.CreateFormFile("files", name)
        fw.Write(data)
    }

    w.WriteField("marginTop", fmt.Sprintf("%.2f", req.Options.MarginTop))
    w.WriteField("paperFormat", req.Options.Format)
    w.Close()

    resp, err := c.http.Post(c.baseURL+"/forms/chromium/convert/html", w.FormDataContentType(), body)
    if err != nil { return nil, err }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}
```

### Templates

All templates live in `backend/internal/templates/pdf/`:

```
backend/internal/templates/pdf/
├── owner_statement.html       # client-facing payout statement
├── breakdown_internal.html    # internal breakdown tab
├── estimate.html              # renovation estimate
├── contract_fixed.html        # fixed price contract
├── contract_cost_plus.html    # cost-plus contract
├── contract_t_and_m.html      # time & materials contract
├── change_order.html          # change order amendment
└── shared/
    ├── style.css              # shared styles
    └── logo.png               # SS logo
```

### Usage in Payout Engine

```go
func (e *engine) GeneratePDF(result *StatementResult) ([]byte, error) {
    tmpl, _ := template.ParseFiles("templates/pdf/owner_statement.html")

    var buf bytes.Buffer
    tmpl.Execute(&buf, result)

    css, _ := os.ReadFile("templates/pdf/shared/style.css")
    logo, _ := os.ReadFile("templates/pdf/shared/logo.png")

    return e.gotenberg.HTMLtoPDF(context.Background(), gotenberg.PDFRequest{
        HTML: buf.String(),
        Assets: map[string][]byte{
            "style.css": css,
            "logo.png":  logo,
        },
        Options: gotenberg.PDFOptions{
            MarginTop: 0.5, MarginBottom: 0.5,
            MarginLeft: 0.75, MarginRight: 0.75,
            Format: "Letter",
        },
    })
}
```

### Store to MinIO After Generation

```go
pdfBytes, err := e.GeneratePDF(result)
key := fmt.Sprintf("statements/%s/%d/%02d/owner_%s.pdf",
    result.PropertyID, year, month, result.ID)
err = s.minio.PutObject(ctx, "statements", key, bytes.NewReader(pdfBytes),
    int64(len(pdfBytes)), "application/pdf")
```

---

## Cal.com (Self-Hosted)

> **Implementation Status: NOT STARTED**
> - Planned for Phase 3 (Renovations Pipeline)
> - No deployment or configuration yet

**Role:** Scheduling for renovation consultations and property walkthroughs.
Clients book directly via an embedded widget in the renovation portal.
Confirmed bookings fire a webhook to our backend.

**Deployment:** Self-hosted Next.js app on Railway. Uses main Postgres
(`calcom` schema) + shared Redis.

```
Image:    calcom/cal.com:latest
Port:     3000 (public-facing)
Schema:   calcom (on main postgres service)
Redis:    shared redis service
```

### Cal.com Configuration

**Event types to create on setup:**

| Event Type | Duration | Description |
|---|---|---|
| Renovation Consultation | 60 min | Initial project discussion with Joel |
| Property Walkthrough | 30 min | On-site assessment for PM or renovation |
| Estimate Review | 30 min | Walk client through submitted estimate |

**Availability:** Joel's working hours configured in Cal.com. Bookings
blocked during active job days automatically via Cal.com's busy time sync.

### Embed in Renovation Portal

```tsx
// frontend/app/(client)/book/page.tsx
import Cal, { getCalApi } from "@calcom/embed-react"

export default function BookConsultation({ projectId }: { projectId: string }) {
    useEffect(() => {
        getCalApi().then((cal) => {
            cal("ui", { styles: { branding: { brandColor: "#0D1B2A" } } })
        })
    }, [])

    return (
        <Cal
            calLink="strathcona/renovation-consultation"
            config={{ name: "Renovation Consultation" }}
            data-cal-namespace="consultation"
        />
    )
}
```

### Webhook Handler

```go
// POST /webhooks/cal
func (h *Handler) CalWebhook(w http.ResponseWriter, r *http.Request) {
    // Verify signature
    sig := r.Header.Get("X-Cal-Signature-256")
    if !verifyCalSignature(r.Body, sig, h.cfg.CalWebhookSecret) {
        w.WriteHeader(http.StatusUnauthorized)
        return
    }

    var event CalEvent
    json.NewDecoder(r.Body).Decode(&event)

    switch event.TriggerEvent {
    case "BOOKING_CREATED":
        h.svc.CreateConsultationFromCal(r.Context(), event)
    case "BOOKING_CANCELLED":
        h.svc.CancelConsultation(r.Context(), event.BookingUID)
    case "BOOKING_RESCHEDULED":
        h.svc.RescheduleConsultation(r.Context(), event)
    }

    w.WriteHeader(http.StatusOK)
}

func (s *Service) CreateConsultationFromCal(ctx context.Context, event CalEvent) error {
    // Upsert contact from attendee info
    contact, _ := s.UpsertContactFromCalBooking(ctx, event.Attendees[0])

    // Create consultation record
    consultation := &domain.Consultation{
        ContactID:   contact.ID,
        CalBookingUID: event.BookingUID,
        EventType:   event.EventType.Slug,
        StartTime:   event.StartTime,
        EndTime:     event.EndTime,
        Notes:       event.Description,
        Status:      "confirmed",
    }
    s.repo.CreateConsultation(ctx, consultation)

    // Open Chatwoot conversation for this contact
    s.chatwoot.CreateConversation(ctx, contact.ChatwootContactID)

    // Notify admin via Novu
    s.novu.Trigger(ctx, "cal.consultation.booked", novu.TriggerPayload{
        To: adminSubscriber,
        Payload: map[string]interface{}{
            "attendee_name": event.Attendees[0].Name,
            "event_type":    event.EventType.Title,
            "start_time":    event.StartTime.Format("Mon Jan 2 at 3:04pm"),
        },
    })

    return nil
}
```

### Data Model Addition

```sql
CREATE TABLE consultations (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id        uuid REFERENCES contacts(id) NOT NULL,
    project_id        uuid REFERENCES projects(id),       -- linked after project created
    cal_booking_uid   text UNIQUE NOT NULL,
    event_type        text NOT NULL,                       -- 'renovation-consultation', 'property-walkthrough'
    start_time        timestamptz NOT NULL,
    end_time          timestamptz NOT NULL,
    status            text DEFAULT 'confirmed',            -- confirmed, cancelled, rescheduled, completed
    notes             text,                                -- attendee notes from Cal.com
    chatwoot_conversation_id bigint,
    outcome           text,                                -- filled after meeting
    project_created   bool DEFAULT false,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_consultations_contact ON consultations(contact_id);
CREATE INDEX idx_consultations_start ON consultations(start_time);
```
