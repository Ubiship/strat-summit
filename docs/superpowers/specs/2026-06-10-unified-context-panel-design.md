# Unified Context Panel Design

**Date:** 2026-06-10
**Status:** Approved
**Author:** Claude + Strathcona Summit team

## Overview

A contextual panel system that surfaces data from integrated services (Novu, Chatwoot, MinIO, Cal.com) directly on entity detail pages in the admin app. Eliminates context switching by bringing notifications, messages, files, and scheduling into the page where staff are already working.

## Problem Statement

Office staff and management constantly switch between the admin app and external service UIs (Chatwoot, calendar, file storage) to get a complete picture when working on a property, booking, job, or contact. This context switching is the primary pain point.

## Solution

Each entity detail page gets a `<ContextPanel>` component displaying related data from all integrated services in tabs. Staff can view history and take actions (send message, upload file, schedule appointment) without leaving the entity page.

## Architecture

**Layout:** Two-column grid on desktop (entity details left, context panel right). Stacks vertically on smaller screens with context panel below.

```
Desktop (lg+):
┌─────────────────────────────────────────────────────────────┐
│ Entity Header (existing)                                    │
├─────────────────────────────────────────────────────────────┤
│ Entity Details (existing)         │  ContextPanel           │
│                                   │  ┌───────────────────┐  │
│ - Property info                   │  │[Activity][Msgs]...│  │
│ - Booking details                 │  ├───────────────────┤  │
│ - Job status                      │  │ Tab content       │  │
│ - etc.                            │  │                   │  │
│                                   │  │                   │  │
│                                   │  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Mobile/Tablet:
┌─────────────────────────────┐
│ Entity Header               │
├─────────────────────────────┤
│ Entity Details              │
│ - Property info             │
│ - Booking details           │
├─────────────────────────────┤
│ ContextPanel                │
│ [Activity][Msgs][Files]     │
│ Tab content                 │
└─────────────────────────────┘
```

### Data Flow

1. Entity page loads and fetches entity data (existing behavior)
2. `<ContextPanel entityType="booking" entityId={id} />` mounts
3. Panel fetches aggregated context data from `/api/v1/context/{type}/{id}`
4. Each tab renders its service-specific content with inline actions

### Backend Endpoint

```
GET /api/v1/context/{entityType}/{entityId}

Response:
{
  "activity": [
    {
      "id": "uuid",
      "eventType": "job.assigned",
      "message": "Job assigned to Maria",
      "timestamp": "2026-06-10T10:00:00Z",
      "metadata": {}
    }
  ],
  "conversations": [
    {
      "id": 123,
      "contactName": "John Smith",
      "lastMessage": "What time is check-in?",
      "lastMessageAt": "2026-06-10T09:30:00Z",
      "unreadCount": 1
    }
  ],
  "files": [
    {
      "key": "bookings/abc-123/contract.pdf",
      "name": "contract.pdf",
      "size": 245000,
      "uploadedAt": "2026-06-08T14:00:00Z",
      "url": "presigned-url"
    }
  ],
  "events": [
    {
      "id": "uuid",
      "title": "Property Inspection",
      "startTime": "2026-06-15T10:00:00Z",
      "endTime": "2026-06-15T11:00:00Z"
    }
  ]
}
```

## Component Structure

Located in `packages/ui/src/context-panel/`:

```
ContextPanel/
├── ContextPanel.tsx        # Main container with tabs
├── ActivityTab.tsx         # Novu notifications list + send action
├── MessagesTab.tsx         # Chatwoot conversations + reply action
├── FilesTab.tsx            # MinIO file list + upload action
├── ScheduleTab.tsx         # Cal.com events + book action
└── types.ts                # Shared types
```

### ContextPanel Props

```typescript
interface ContextPanelProps {
  entityType: 'property' | 'booking' | 'job' | 'contact';
  entityId: string;
  enabledTabs?: ('activity' | 'messages' | 'files' | 'schedule')[];
}
```

### Tab Visibility by Entity Type

| Entity   | Activity | Messages | Files | Schedule |
|----------|----------|----------|-------|----------|
| Property | Yes      | Yes      | Yes   | Yes      |
| Booking  | Yes      | Yes      | Yes   | Yes      |
| Job      | Yes      | No       | Yes   | No       |
| Contact  | Yes      | Yes      | Yes   | Yes      |

Jobs exclude messages (cleaners get SMS via Novu) and schedule (job has its own time slot). Job files are for before/after photos.

## Data Model

### New Table: entity_context

Links entities to external service records for efficient lookup.

```sql
CREATE TABLE entity_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  service VARCHAR(20) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(entity_type, entity_id, service, external_id)
);

CREATE INDEX idx_entity_context_lookup
  ON entity_context(entity_type, entity_id, service);
```

**entity_type:** `property`, `booking`, `job`, `contact`
**service:** `novu`, `chatwoot`, `minio`, `calcom`
**external_id:** ID in the external service
**metadata:** Service-specific data (conversation status, file metadata, etc.)

## Action Endpoints

For inline actions from the panel:

```
POST /api/v1/context/messages/send
Body: { entityType, entityId, content }
Routes to Chatwoot → sends message to linked conversation

POST /api/v1/context/notifications/trigger
Body: { entityType, entityId, eventType, payload }
Routes to Novu → triggers notification

POST /api/v1/context/files/upload
Body: multipart/form-data with entityType, entityId, file
Routes to MinIO → stores with entity prefix

POST /api/v1/context/schedule/book
Body: { entityType, entityId, eventTypeId, startTime, attendeeEmail }
Routes to Cal.com → creates booking
```

## Phased Rollout

### Phase 1: Novu Activity Panel

**Scope:**
- Add `entity_context` table and migration
- Implement `/api/v1/context/{type}/{id}` endpoint (activity data only)
- Build `ContextPanel` and `ActivityTab` components
- Integrate into Property, Booking, Job, Contact detail pages
- Update Novu trigger calls to store `entity_context` links
- Add "Send notification" action for manual triggers

**Outcome:** Staff see notification history on entity pages with ability to send manual notifications.

### Phase 2: Chatwoot Messages Panel

**Scope:**
- Add `MessagesTab` component
- Extend context endpoint to fetch linked Chatwoot conversations
- Implement inline reply action via `/api/v1/context/messages/send`
- Update Chatwoot webhook handler to auto-link conversations to entities based on contact

**Outcome:** View conversation history and reply without leaving the entity page.

### Phase 3: MinIO Files Panel

**Scope:**
- Add `FilesTab` component
- Implement file listing by entity prefix pattern
- Add upload action with drag-and-drop support
- Generate presigned URLs for secure downloads
- Define storage path conventions per entity type

**Outcome:** View, upload, and download files directly on entity pages.

### Phase 4: Cal.com Schedule Panel

**Scope:**
- Build Cal.com integration client in `backend/internal/integrations/calcom/`
- Add `ScheduleTab` component
- Implement booking action (embedded widget or direct API)
- Link calendar events to entities via event metadata
- Define event types per entity (inspection, viewing, contractor visit)

**Outcome:** See upcoming appointments and schedule new ones from entity pages.

## File Storage Conventions

MinIO path prefixes by entity type:

```
properties/{propertyId}/
  contracts/
  photos/
  statements/{year}/{month}/

bookings/{bookingId}/
  guest-documents/

jobs/{jobId}/
  photos/before/
  photos/after/

contacts/{contactId}/
  documents/
```

## Error Handling

- Context endpoint returns partial data if a service is unavailable
- Each tab displays service-specific error state
- Actions show inline error messages, don't block other tabs
- Failed service calls logged but don't fail the page load

## Security

- All endpoints require authentication via existing JWT middleware
- File uploads validated for type and size
- Presigned URLs expire after 1 hour
- Action endpoints verify user has access to the entity before routing to external service

## Testing Strategy

- Unit tests for context aggregation logic
- Integration tests for each external service client
- Component tests for panel tabs with mocked data
- E2E tests for critical flows (view notifications, send message, upload file)
