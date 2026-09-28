# Customer Cleaning Booking API Design

## Overview

A small TypeScript API so anyone can request a one-off house clean from Strathcona Summit. The customer picks a service from a fixed menu, gives an address, a date, and a time window. The request is saved as `requested`. Staff later confirm or decline it in the same API. There is no payment and no live calendar.

This service is separate from the Go operations backend. Vacation-rental stays, cleaning jobs tied to properties, Chatwoot, and Novu stay where they are.

**Stack:** Hono, Drizzle, Clerk, Postgres, Redis. The API, Postgres, and Redis run on Railway. Clerk is the only identity provider.

## Monorepo

New package at `services/booking-api`, named `@repo/booking-api`. It runs on Node 20, matching the repo engines field.

Add `services/*` to `pnpm-workspace.yaml` so the package is part of the pnpm workspace.

## Runtime

Railway runs three services for this feature:

| Service | Role |
|---|---|
| `booking-api` | Hono process |
| Postgres | Bookings, users, service catalog |
| Redis | Catalog cache and create-request counter |

Environment variables for the API:

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `CLERK_SECRET_KEY` | Verify session tokens |
| `PORT` | Listen port |

The client sends `Authorization: Bearer <clerk session token>` on every route except `GET /health`.

## Modules

| Module | Responsibility |
|---|---|
| HTTP | Hono routes for health, catalog, and bookings |
| Auth | Verify the Clerk session and read `publicMetadata.role` |
| Bookings | Create a request and apply the two status changes |
| Data | Drizzle writes to Postgres. Redis caches the catalog and counts creates |

Authorization uses the role on the verified Clerk session. The local `users` row is updated from that session and exists so a booking can reference a stable id. A missing role, or any role other than `customer` or `staff`, is rejected. Staff users are created in the Clerk dashboard with `publicMetadata.role` set to `staff`.

## Routes

Routes sit at the service root.

| Method | Path | Who | Success |
|---|---|---|---|
| `GET` | `/health` | anyone | 200 `{ "status": "ok" }` |
| `GET` | `/services` | customer or staff | 200 `{ "services": [...] }` |
| `POST` | `/bookings` | customer | 201 booking |
| `GET` | `/bookings` | customer | 200 `{ "bookings": [...] }` own rows, newest first, every status |
| `GET` | `/admin/bookings` | staff | 200 `{ "bookings": [...] }` status `requested` only, newest first |
| `POST` | `/admin/bookings/:id/confirm` | staff | 200 booking |
| `POST` | `/admin/bookings/:id/decline` | staff | 200 booking |

`GET /health` reports that the process is up. It does not check Postgres, Redis, or Clerk.

Every response includes an `x-request-id` header. The API generates one when the request does not already send it.

## Data model

Prices are Canadian cents. The three services are inserted by a migration. Changing a name, description, or price in this version means editing that seed. There is no catalog edit API.

### services

| Column | Notes |
|---|---|
| `id` | uuid primary key |
| `slug` | unique: `standard`, `deep`, `move-out` |
| `name` | display name |
| `description` | short text |
| `starting_price_cents` | informational starting price |
| `active` | boolean |
| `sort_order` | integer |
| `created_at`, `updated_at` | timestamptz |

Seed, all `active = true`:

| slug | name | description | starting price | sort |
|---|---|---|---|---|
| `standard` | Standard clean | A regular whole-home clean: kitchens, bathrooms, floors, and surfaces. | $149 (`14900`) | 1 |
| `deep` | Deep clean | A detailed clean that includes inside appliances, baseboards, and built-up grime. | $249 (`24900`) | 2 |
| `move-out` | Move-out clean | An empty-home clean for a move-out or handover. | $329 (`32900`) | 3 |

`GET /services` returns active rows only, ordered by `sort_order`, with `slug`, `name`, `description`, and `starting_price_cents`.

### users

Upserted on each authenticated request from the Clerk session.

| Column | Notes |
|---|---|
| `id` | uuid primary key |
| `clerk_user_id` | unique |
| `role` | `customer` or `staff`, copied from the session |
| `email` | nullable |
| `name` | nullable |
| `created_at`, `updated_at` | timestamptz |

### bookings

| Column | Notes |
|---|---|
| `id` | uuid primary key |
| `customer_id` | fk `users` |
| `service_id` | fk `services` |
| `price_shown_cents` | copied from the service at insert time |
| `status` | `requested`, `confirmed`, or `declined` |
| `address_line1` | required, 1–120 chars |
| `address_line2` | optional, max 120 chars |
| `city` | required, 1–80 chars |
| `province` | Canadian code. Any case is accepted and stored uppercase. |
| `postal_code` | stored as `A1A 1A1` |
| `service_date` | date, today or later in `America/Vancouver` |
| `time_window` | `morning`, `afternoon`, or `evening` |
| `notes` | customer note, nullable, max 1000 chars |
| `staff_note` | nullable, max 500 chars |
| `decided_by` | nullable fk `users`, the staff user |
| `decided_at` | nullable timestamptz |
| `created_at`, `updated_at` | timestamptz |

Indexes: unique `users.clerk_user_id`, unique `services.slug`, `bookings (customer_id, created_at desc)`, `bookings (status, created_at desc)`.

Time windows mean local ranges and are stored as the enum, not as clock times:

| Value | Range |
|---|---|
| `morning` | 8:00–12:00 |
| `afternoon` | 12:00–16:00 |
| `evening` | 16:00–20:00 |

Province must be one of `AB`, `BC`, `MB`, `NB`, `NL`, `NS`, `NT`, `NU`, `ON`, `PE`, `QC`, `SK`, `YT`.

Postal codes: strip spaces, uppercase, and require the Canadian pattern `^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$` after formatting. Store with the single space.

## Request and response bodies

### Create booking

`POST /bookings`

```json
{
  "service_slug": "standard",
  "address_line1": "123 Main St",
  "address_line2": null,
  "city": "Campbell River",
  "province": "BC",
  "postal_code": "V9W 1A1",
  "service_date": "2026-10-01",
  "time_window": "morning",
  "notes": "Dog on site"
}
```

`notes` may be omitted. Blank notes are stored as null. `address_line2` may be omitted or null.

### Confirm

`POST /admin/bookings/:id/confirm`

```json
{ "staff_note": "We can do Tuesday morning." }
```

`staff_note` may be omitted or blank. A blank note is stored as null.

### Decline

`POST /admin/bookings/:id/decline`

```json
{ "staff_note": "That week is fully booked." }
```

`staff_note` is required, 1–500 characters after trim.

### Booking JSON

Customer responses:

```json
{
  "id": "uuid",
  "service_slug": "standard",
  "service_name": "Standard clean",
  "price_shown_cents": 14900,
  "status": "requested",
  "address_line1": "123 Main St",
  "address_line2": null,
  "city": "Campbell River",
  "province": "BC",
  "postal_code": "V9W 1A1",
  "service_date": "2026-10-01",
  "time_window": "morning",
  "notes": "Dog on site",
  "staff_note": null,
  "decided_at": null,
  "created_at": "2026-09-28T18:00:00.000Z"
}
```

Staff responses add the customer contact fields:

```json
{
  "customer_name": "Alex Lee",
  "customer_email": "alex@example.com"
}
```

`decided_by` stays in the database and is omitted from JSON.

## Behavior

**Session.** Verify the bearer token with the Clerk backend SDK. Read `publicMetadata.role`. Upsert `users` with the Clerk id, email, name, and role. Then run the route.

**Catalog.** `GET /services` reads Redis key `catalog:active`. On a miss, load active services from Postgres, store the JSON for 600 seconds, and return it. Customers and staff share this route.

**Create.** Customer only. The handler validates the body before it touches Redis. Validation checks fields in this order and stops at the first failure: `service_slug`, `address_line1`, `address_line2`, `city`, `province`, `postal_code`, `service_date`, `time_window`, `notes`. A 400 does not increment the create counter.

`service_date` must be a real calendar date in `YYYY-MM-DD`. It must be today or later in `America/Vancouver`. The service slug must belong to an active service. `time_window` must be one of the three values.

After validation, Redis key `ratelimit:booking:{clerkUserId}` is incremented. The 3600-second TTL is set only when the count becomes 1. Counts of 1 through 5 copy `starting_price_cents` into `price_shown_cents` and insert status `requested`. A count above 5 returns 429 and does not insert. `Retry-After` is the remaining TTL in seconds. If the insert fails after the counter increments, the count is left as it is.

**Customer list.** Rows for that customer only, newest first, all statuses.

**Staff list.** Rows with status `requested` only, newest first, including customer name and email.

**Decision.** Confirm and decline load the booking by id. They write only when status is `requested`. The update sets status, `staff_note`, `decided_by`, and `decided_at` in one statement. A booking that is already `confirmed` or `declined` is left unchanged.

## Errors

```json
{
  "error": {
    "code": "validation_error",
    "message": "Service date must be today or later.",
    "fields": { "service_date": "must be today or later" }
  }
}
```

`fields` is included only when a specific field failed validation. A body that is not JSON omits `fields`.

| Situation | HTTP | code | message |
|---|---|---|---|
| Missing or invalid Clerk session | 401 | `unauthorized` | Sign in required. |
| Session role is missing or unknown | 403 | `forbidden` | You do not have access to this action. |
| Customer calls a staff route, or staff calls `POST /bookings` | 403 | `forbidden` | You do not have access to this action. |
| Body is not JSON | 400 | `validation_error` | Request body must be JSON. No `fields` object. |
| Unknown or inactive service, impossible or past date, bad window, missing address, address over its length cap, bad postal code, bad province, customer notes over 1000 characters, staff note over 500 characters, decline without a note | 400 | `validation_error` | One sentence for the first failing field. `fields` names that field. |
| More than 5 creates in the current Redis window | 429 | `rate_limited` | Too many booking requests. Try again later. |
| Confirm or decline for an unknown id | 404 | `not_found` | Booking not found. |
| Confirm or decline when status is already `confirmed` or `declined` | 409 | `conflict` | Booking has already been decided. |
| Postgres unavailable, or any other unexpected failure | 500 | `internal_error` | Something went wrong. |

500 responses contain no stack traces or SQL. Redis catalog failures and Redis rate-limit failures are logged with the request id.

If Redis errors on a catalog read, the API loads services from Postgres and still returns 200. If Redis errors while counting creates, the API still inserts the booking and returns 201.

## Testing

Vitest. Tests call real Hono routes through the request helper. Auth, Postgres, and Redis are fakes injected into the app. CI does not need Clerk, Railway, or a live database.

**Rules, no I/O**

- Status changes only from `requested` to `confirmed` or `declined`.
- A second decision is rejected.
- A decline without a note is rejected.
- A date before today in `America/Vancouver` is rejected. Today's date is accepted.
- Postal codes normalize to `A1A 1A1`.
- Notes over 1000 characters, and staff notes over 500, are rejected.

**Routes**

- Missing session returns 401 `unauthorized`.
- A session with no role returns 403 `forbidden`.
- A customer calling `GET /admin/bookings` returns 403.
- A staff user calling `POST /bookings` returns 403.
- A valid create returns 201 with status `requested` and `price_shown_cents` copied from the service.
- An inactive service or a past date returns 400 `validation_error`.
- The 6th create in the window returns 429 `rate_limited` and does not insert.
- `GET /bookings` returns only that customer's rows.
- Confirm on `requested` returns `confirmed`.
- Decline without a note returns 400.
- A second decision returns 409 `conflict` and leaves the row unchanged.
- An unknown booking id returns 404 `not_found`.

**Redis**

- A catalog cache hit does not query Postgres.
- A Redis error on catalog read still returns the Postgres rows.
- A Redis error on the create counter still saves the booking.

## Out of scope

- Payment, quotes beyond the stored starting price, and price editing in an admin UI
- Email, SMS, or other notifications
- A live availability calendar or slot locking
- Listing decided bookings for staff, or fetching one booking by id for a customer
- Syncing requests into the Go operations API
- A customer or staff web UI
