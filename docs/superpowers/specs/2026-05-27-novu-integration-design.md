# Novu Integration Design Spec

## Overview

Self-hosted Novu on Railway as the unified notification hub for Strathcona Summit Solutions. Routes all SMS (Twilio), Email (Resend), and In-app notifications through a single API.

**Status:** Approved
**Date:** 2026-05-27

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Railway Network                          │
│  ┌─────────┐   ┌─────────────┐   ┌─────────────────────┐    │
│  │ Go API  │──▶│ Novu Server │──▶│ Redis (shared)      │    │
│  └─────────┘   └─────────────┘   └─────────────────────┘    │
│       │              │                                       │
│       │              ├──▶ Twilio (SMS provider)             │
│       │              ├──▶ Resend (Email provider)           │
│       │              └──▶ In-app (WebSocket to frontend)    │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────┐   ┌─────────────┐                          │
│  │ PostgreSQL  │   │  MongoDB    │  (Novu workflow storage) │
│  └─────────────┘   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌────────────┐
    │ Next.js    │  <NovuProvider> for in-app notifications
    │ Frontend   │
    └────────────┘
```

**Data Flow:**
1. Backend triggers notification via `novu.Trigger(eventName, subscriberID, payload)`
2. Novu routes to appropriate channel(s) based on workflow template
3. SMS → Twilio, Email → Resend, In-app → WebSocket to frontend

---

## Railway Deployment

### Novu Services

| Service | Image | Resources |
|---------|-------|-----------|
| novu-api | `ghcr.io/novuhq/novu/api` | 512MB RAM |
| novu-worker | `ghcr.io/novuhq/novu/worker` | 512MB RAM |
| novu-ws | `ghcr.io/novuhq/novu/ws` | 256MB RAM |
| mongodb | `mongo:6` | 512MB RAM |

### Environment Variables

```bash
# Novu services
NODE_ENV=production
MONGO_URL=mongodb://mongo:27017/novu
REDIS_URL=redis://redis:6379
JWT_SECRET=${NOVU_JWT_SECRET}

# Provider credentials
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_FROM_NUMBER=${TWILIO_FROM_NUMBER}
RESEND_API_KEY=${RESEND_API_KEY}

# API URLs
API_ROOT_URL=https://novu-api.railway.internal
WS_ROOT_URL=https://novu-ws.railway.internal
```

### Backend Environment Variables (Go API)

```bash
NOVU_API_KEY=<generated-in-novu-dashboard>
NOVU_API_URL=http://novu-api:3000
NOVU_APP_ID=<from-novu-dashboard>
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_NOVU_APP_ID=<from-novu-dashboard>
NEXT_PUBLIC_NOVU_WS_URL=https://novu-ws.your-domain.com
```

---

## Notification Events (18 Total)

### Cleaning/Jobs

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `job.assigned` | SMS + In-app | Assigned cleaners | Staff assigned to job |
| `job.reminder` | SMS | Assigned cleaners | 2hrs before scheduled (cron) |
| `job.completed` | In-app | Admin | Job marked complete |

### Bookings

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `booking.confirmed` | Email + In-app | Admin | Booking created |
| `booking.direct.new` | In-app | Admin | Direct inquiry received |

### Statements

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `statement.generated` | In-app | Admin | Monthly statement ready |
| `statement.sent` | Email | Property owner | Statement delivered |

### Renovations

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `estimate.sent` | Email | Client | Estimate PDF sent |
| `estimate.accepted` | In-app | Admin | Client accepts estimate |
| `contract.signed` | In-app + Email | Admin + Client | Dropbox Sign complete |
| `change_order.submitted` | In-app | Admin | Change order requested |
| `change_order.approved` | Email + In-app | Client + Admin | CO approved |
| `change_order.rejected` | Email + In-app | Client + Admin | CO rejected |

### Financial & Alerts

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `payment.received` | In-app | Admin | Payment logged |
| `hot_tub.alert` | SMS + In-app | Admin | Hot tub issue flagged |

### Reports

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `report.weekly` | Email | Admin | Weekly cron (Monday 7am) |
| `report.monthly` | Email | Admin + Bookkeeper | Monthly cron (1st, 7am) |
| `expense.pending` | In-app | Admin | Receipt needs review |

### Scheduling

| Event | Channels | Recipients | Trigger Point |
|-------|----------|------------|---------------|
| `cal.consultation.booked` | In-app + Email | Admin | Cal.com booking created |

---

## Template Variables

| Event Category | Variables |
|----------------|-----------|
| `job.*` | firstName, propertyName, propertyAddr, jobDate, jobId |
| `booking.*` | guestName, checkIn, checkOut, propertyName, nights, revenue |
| `statement.*` | ownerName, month, propertyName, grossRevenue, commission, payout, pdfUrl |
| `estimate.*` | clientName, projectName, total, validUntil, pdfUrl |
| `contract.*` | clientName, projectName, contractType |
| `change_order.*` | clientName, projectName, changeDescription, amount |
| `hot_tub.alert` | propertyName, status, notes, photoUrl |
| `report.*` | reportType, periodStart, periodEnd, summaryStats |
| `expense.pending` | vendorName, amount, category, receiptUrl |
| `cal.*` | clientName, consultationType, dateTime, duration |

---

## Go Client Implementation

### Client Structure

```go
// backend/internal/integrations/novu/client.go

type Client struct {
    apiKey  string
    baseURL string
    http    *http.Client
}

type Subscriber struct {
    SubscriberID string            `json:"subscriberId"`
    Email        string            `json:"email,omitempty"`
    Phone        string            `json:"phone,omitempty"`
    FirstName    string            `json:"firstName,omitempty"`
    LastName     string            `json:"lastName,omitempty"`
    Data         map[string]any    `json:"data,omitempty"`
}

type TriggerPayload struct {
    Name         string         `json:"name"`
    To           TriggerTo      `json:"to"`
    Payload      map[string]any `json:"payload"`
    Overrides    map[string]any `json:"overrides,omitempty"`
}

type TriggerTo struct {
    SubscriberID string `json:"subscriberId"`
    Email        string `json:"email,omitempty"`
    Phone        string `json:"phone,omitempty"`
}
```

### Client Methods

```go
func New(apiKey, baseURL string) *Client

func (c *Client) UpsertSubscriber(ctx context.Context, sub Subscriber) error
func (c *Client) DeleteSubscriber(ctx context.Context, subscriberID string) error
func (c *Client) Trigger(ctx context.Context, eventID string, subscriberID string, payload map[string]any) error
func (c *Client) BulkTrigger(ctx context.Context, eventID string, subscribers []string, payload map[string]any) error
```

---

## Service Layer Integration

### Service Structure Update

```go
// backend/internal/service/service.go

type Service struct {
    cfg  *config.Config
    repo *repository.Repository
    novu *novu.Client  // Add this
}

func New(cfg *config.Config, repo *repository.Repository, novuClient *novu.Client) *Service {
    return &Service{
        cfg:  cfg,
        repo: repo,
        novu: novuClient,
    }
}
```

### Notification Helper Methods

```go
// backend/internal/service/notifications.go

func (s *Service) NotifyJobAssigned(ctx context.Context, job *domain.CleaningJob, staff *domain.Contact, property *domain.Property) error {
    return s.novu.Trigger(ctx, "job.assigned", staff.ID.String(), map[string]any{
        "firstName":    staff.FirstName,
        "propertyName": property.Name,
        "propertyAddr": property.Address,
        "jobDate":      job.ScheduledDate.Format("Monday, Jan 2"),
        "jobId":        job.ID.String(),
    })
}

func (s *Service) NotifyBookingConfirmed(ctx context.Context, booking *domain.Booking, property *domain.Property) error {
    // Notify all admins
    admins, _ := s.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
    for _, admin := range admins {
        s.novu.Trigger(ctx, "booking.confirmed", admin.ID.String(), map[string]any{
            "guestName":    booking.GuestName,
            "propertyName": property.Name,
            "checkIn":      booking.CheckIn.Format("Jan 2"),
            "checkOut":     booking.CheckOut.Format("Jan 2"),
            "nights":       booking.Nights,
            "revenue":      booking.GrossRevenue,
        })
    }
    return nil
}

func (s *Service) NotifyHotTubAlert(ctx context.Context, job *domain.CleaningJob, property *domain.Property, status, notes string) error {
    admins, _ := s.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
    for _, admin := range admins {
        s.novu.Trigger(ctx, "hot_tub.alert", admin.ID.String(), map[string]any{
            "propertyName": property.Name,
            "status":       status,
            "notes":        notes,
        })
    }
    return nil
}

// ... similar methods for all 18 events
```

### Integration Points

| Service Method | Notification Triggered |
|----------------|------------------------|
| `AssignStaffToJob()` | `job.assigned` |
| `ClockOutJob()` (with complete status) | `job.completed` |
| `CreateBooking()` | `booking.confirmed` |
| Cron: 2hrs before job | `job.reminder` |
| `GenerateOwnerStatement()` | `statement.generated` |
| `SendOwnerStatement()` | `statement.sent` |
| `SendEstimate()` | `estimate.sent` |
| Dropbox webhook | `contract.signed` |
| `CreateChangeOrder()` | `change_order.submitted` |
| `ApproveChangeOrder()` | `change_order.approved` |
| `RejectChangeOrder()` | `change_order.rejected` |
| `RecordPayment()` | `payment.received` |
| `FlagHotTubIssue()` | `hot_tub.alert` |
| Cron: weekly | `report.weekly` |
| Cron: monthly | `report.monthly` |
| `CreateExpense()` | `expense.pending` |
| Cal.com webhook | `cal.consultation.booked` |

---

## Subscriber Sync

### Contact Creation Flow

```go
func (s *Service) CreateContact(ctx context.Context, c *domain.Contact) error {
    if err := s.repo.CreateContact(ctx, c); err != nil {
        return err
    }

    // Sync to Novu
    return s.novu.UpsertSubscriber(ctx, novu.Subscriber{
        SubscriberID: c.ID.String(),
        Email:        c.Email,
        Phone:        c.Phone,
        FirstName:    c.FirstName,
        LastName:     c.LastName,
    })
}
```

### Database

The `contacts.novu_subscriber_id` is a generated column (`id::text`) so no migration needed beyond what exists.

---

## Frontend Integration

### NovuProvider Setup

```tsx
// frontend/src/providers/NovuProvider.tsx
'use client';

import { NovuProvider as NovuProviderBase } from '@novu/notification-center';

interface Props {
  children: React.ReactNode;
  subscriberId: string;
}

export function NovuProvider({ children, subscriberId }: Props) {
  return (
    <NovuProviderBase
      subscriberId={subscriberId}
      applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID!}
      backendUrl={process.env.NEXT_PUBLIC_NOVU_WS_URL}
    >
      {children}
    </NovuProviderBase>
  );
}
```

### NotificationBell Component

```tsx
// frontend/src/components/NotificationBell.tsx
'use client';

import {
  NotificationBell as NovuBell,
  PopoverNotificationCenter
} from '@novu/notification-center';

export function NotificationBell() {
  return (
    <PopoverNotificationCenter colorScheme="light">
      {({ unseenCount }) => (
        <NovuBell unseenCount={unseenCount} />
      )}
    </PopoverNotificationCenter>
  );
}
```

### Usage in Layout

```tsx
// frontend/src/app/(admin)/layout.tsx
import { NovuProvider } from '@/providers/NovuProvider';
import { NotificationBell } from '@/components/NotificationBell';

export default function AdminLayout({ children }) {
  const user = await getUser(); // from auth context

  return (
    <NovuProvider subscriberId={user.id}>
      <header>
        <nav>...</nav>
        <NotificationBell />
        <UserMenu />
      </header>
      {children}
    </NovuProvider>
  );
}
```

---

## Workflow Templates

Templates are configured in Novu dashboard after deployment. Example workflow structure:

### `job.assigned` Workflow

```yaml
name: job.assigned
steps:
  - channel: sms
    template: |
      Hi {{firstName}}, you've been assigned to clean {{propertyName}} on {{jobDate}}.
      Address: {{propertyAddr}}

  - channel: in_app
    template:
      title: "New Job Assigned"
      body: "{{propertyName}} - {{jobDate}}"
      action_url: "/staff/jobs/{{jobId}}"
```

### `statement.sent` Workflow

```yaml
name: statement.sent
steps:
  - channel: email
    template:
      subject: "Your {{month}} Owner Statement - {{propertyName}}"
      body: |
        <h1>{{month}} Statement</h1>
        <p>Dear {{ownerName}},</p>
        <p>Your statement for {{propertyName}} is ready.</p>
        <ul>
          <li>Gross Revenue: ${{grossRevenue}}</li>
          <li>Commission: ${{commission}}</li>
          <li>Net Payout: ${{payout}}</li>
        </ul>
        <p><a href="{{pdfUrl}}">Download PDF</a></p>
```

---

## Cron Jobs

Three notification events are triggered by scheduled jobs rather than user actions:

### Job Reminder (2 hours before)

```go
// backend/internal/jobs/reminder.go
// Runs every 15 minutes, finds jobs starting in 2 hours

func (j *Jobs) SendJobReminders(ctx context.Context) error {
    twoHoursFromNow := time.Now().Add(2 * time.Hour)
    jobs, _ := j.repo.ListCleaningJobsByDateRange(ctx, twoHoursFromNow, twoHoursFromNow.Add(15*time.Minute))

    for _, job := range jobs {
        if job.ReminderSentAt != nil {
            continue // Already sent
        }
        staff, _ := j.repo.GetStaffForJob(ctx, job.ID)
        for _, s := range staff {
            j.svc.NotifyJobReminder(ctx, job, s)
        }
        j.repo.MarkReminderSent(ctx, job.ID)
    }
    return nil
}
```

**Schedule:** `*/15 * * * *` (every 15 minutes)

### Weekly Report

```go
// backend/internal/jobs/reports.go
// Runs Monday 7am, sends weekly summary to admin

func (j *Jobs) SendWeeklyReport(ctx context.Context) error {
    stats := j.svc.GenerateWeeklyStats(ctx)
    admins, _ := j.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
    for _, admin := range admins {
        j.novu.Trigger(ctx, "report.weekly", admin.ID.String(), stats)
    }
    return nil
}
```

**Schedule:** `0 7 * * 1` (Monday 7am)

### Monthly Report

```go
// backend/internal/jobs/reports.go
// Runs 1st of month 7am, sends monthly summary to admin + bookkeeper

func (j *Jobs) SendMonthlyReport(ctx context.Context) error {
    stats := j.svc.GenerateMonthlyStats(ctx)
    recipients, _ := j.repo.ListContactsByRoles(ctx, []domain.UserRole{domain.RoleAdmin, domain.RoleBookkeeper})
    for _, r := range recipients {
        j.novu.Trigger(ctx, "report.monthly", r.ID.String(), stats)
    }
    return nil
}
```

**Schedule:** `0 7 1 * *` (1st of month, 7am)

### Cron Registration

```go
// backend/cmd/server/main.go

import "github.com/robfig/cron/v3"

func main() {
    // ... existing setup ...

    c := cron.New()
    c.AddFunc("*/15 * * * *", jobs.SendJobReminders)
    c.AddFunc("0 7 * * 1", jobs.SendWeeklyReport)
    c.AddFunc("0 7 1 * *", jobs.SendMonthlyReport)
    c.Start()

    // ... server start ...
}
```

---

## Testing Strategy

### Unit Tests

- `novu/client_test.go` — Mock HTTP responses, verify request payloads
- `service/notifications_test.go` — Verify correct events triggered with correct data

### Integration Tests

- Deploy Novu locally via Docker Compose
- Verify end-to-end: trigger → delivery to test phone/email

### Manual Testing

- Novu dashboard shows event logs
- Verify SMS delivery to test number
- Verify email delivery to test inbox
- Verify in-app notifications in frontend

---

## Implementation Order

1. Deploy MongoDB to Railway
2. Deploy Novu services (api, worker, ws) to Railway
3. Configure Twilio + Resend providers in Novu dashboard
4. Create workflow templates for all 18 events
5. Update Go client with full implementation
6. Add notification helper methods to service layer
7. Wire notifications into existing service methods
8. Add cron jobs for `job.reminder`, `report.weekly`, `report.monthly`
9. Add frontend NovuProvider and NotificationBell
10. Test all notification flows

---

## Success Criteria

- [ ] Novu services running on Railway
- [ ] All 18 workflow templates configured
- [ ] Staff receives SMS when assigned to job
- [ ] Admin receives in-app notification when job completed
- [ ] Owner receives email with statement PDF link
- [ ] Frontend notification bell shows unseen count
- [ ] Cron jobs trigger reminder/report notifications
