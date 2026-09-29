# Direct Booking Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the SSS website into a direct-booking platform with Hostaway API integration for properties, availability, and pricing, plus Go backend webhook handler for booking sync.

**Architecture:** Next.js frontend queries Hostaway API for guest-facing data (properties, availability, pricing, reviews) with ISR caching. Checkout redirects to Hostaway's hosted checkout. Go backend receives Hostaway webhooks to create bookings and cleaning jobs in PostgreSQL.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Go 1.22, chi router, pgx, Hostaway API

**Spec:** `docs/superpowers/specs/2026-09-29-direct-booking-platform-design.md`

## Global Constraints

- Next.js 16 with App Router, React 19, Tailwind CSS v4
- Go 1.22 with chi router, pgx for PostgreSQL
- Server Components by default; `'use client'` only for interactivity
- Hostaway API credentials server-side only (never exposed to browser)
- Follow existing patterns in codebase (handler thin, service for business logic)
- Mobile-first responsive design
- ISR caching: 1 hour for properties, 6 hours for reviews, real-time for availability/pricing

## Review Focus

1. **Hostaway API rate limiting** — API calls should handle 429 responses gracefully with retry logic
2. **Missing/invalid Hostaway credentials** — Pages should show meaningful error states, not crash
3. **Property without photos** — Property cards/pages must handle empty photo arrays
4. **Webhook signature verification failure** — Should return 401, log the attempt, and not process payload
5. **Property ID mismatch** — Webhook referencing unknown `hostaway_id` should log error, not crash

---

## Task 1: Database Migration for Hostaway Integration

**Files:**
- Create: `backend/migrations/000014_add_hostaway_columns.up.sql`
- Create: `backend/migrations/000014_add_hostaway_columns.down.sql`

**Interfaces:**
- Consumes: Existing `properties` and `bookings` tables
- Produces: `properties.hostaway_id TEXT UNIQUE`, `bookings.external_id TEXT UNIQUE`, `bookings.source` updated with 'hostaway' value

- [ ] **Step 1: Write the up migration**

```sql
-- 000014_add_hostaway_columns.up.sql
ALTER TABLE properties ADD COLUMN hostaway_id TEXT UNIQUE;
CREATE INDEX idx_properties_hostaway_id ON properties(hostaway_id) WHERE hostaway_id IS NOT NULL;

ALTER TABLE bookings ADD COLUMN external_id TEXT UNIQUE;
CREATE INDEX idx_bookings_external_id ON bookings(external_id) WHERE external_id IS NOT NULL;
```

- [ ] **Step 2: Write the down migration**

```sql
-- 000014_add_hostaway_columns.down.sql
DROP INDEX IF EXISTS idx_bookings_external_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS external_id;

DROP INDEX IF EXISTS idx_properties_hostaway_id;
ALTER TABLE properties DROP COLUMN IF EXISTS hostaway_id;
```

- [ ] **Step 3: Run migration locally to verify**

Run: `cd backend && migrate -path migrations -database $DATABASE_URL up`
Expected: Migration applies successfully

- [ ] **Step 4: Commit**

```bash
git add backend/migrations/000014_add_hostaway_columns.up.sql backend/migrations/000014_add_hostaway_columns.down.sql
git commit -m "feat(db): add hostaway_id and external_id columns for Hostaway integration"
```

---

## Task 2: Hostaway Client (Go Backend)

**Files:**
- Create: `backend/internal/integrations/hostaway/types.go`
- Create: `backend/internal/integrations/hostaway/client.go`
- Create: `backend/internal/integrations/hostaway/client_test.go`

**Interfaces:**
- Consumes: `config.Config` for API credentials
- Produces:
  - `hostaway.Config{BaseURL, APIKey, AccountID, WebhookSecret string}`
  - `hostaway.Client` with `WebhookSecret() string`
  - `hostaway.Reservation{ID, ListingID int64; CheckInDate, CheckOutDate string; GuestName, GuestEmail, GuestPhone, Source string; TotalPrice float64; Status string}`
  - `hostaway.WebhookPayload{Event string; Data *Reservation}`

- [ ] **Step 1: Write test for webhook signature verification**

```go
// client_test.go
func TestVerifyWebhookSignature_Valid(t *testing.T) {
    client := New(Config{WebhookSecret: "test-secret"})
    body := []byte(`{"event":"reservation.created"}`)

    mac := hmac.New(sha256.New, []byte("test-secret"))
    mac.Write(body)
    signature := hex.EncodeToString(mac.Sum(nil))

    assert.True(t, client.VerifySignature(body, signature))
}

func TestVerifyWebhookSignature_Invalid(t *testing.T) {
    client := New(Config{WebhookSecret: "test-secret"})
    body := []byte(`{"event":"reservation.created"}`)

    assert.False(t, client.VerifySignature(body, "invalid-signature"))
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && go test ./internal/integrations/hostaway/... -v`
Expected: FAIL — package does not exist

- [ ] **Step 3: Implement types.go**

Define `Config`, `Reservation`, `WebhookPayload` structs matching Hostaway API response format.

- [ ] **Step 4: Implement client.go**

Implement `New(cfg Config) *Client`, `WebhookSecret() string`, `VerifySignature(body []byte, signature string) bool`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && go test ./internal/integrations/hostaway/... -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/internal/integrations/hostaway/
git commit -m "feat(backend): add Hostaway client with webhook signature verification"
```

---

## Task 3: Hostaway Webhook Handler (Go Backend)

**Files:**
- Create: `backend/internal/handler/webhook_hostaway.go`
- Create: `backend/internal/handler/webhook_hostaway_test.go`
- Modify: `backend/internal/handler/router.go:38` (add webhook route)

**Interfaces:**
- Consumes: `hostaway.Client.VerifySignature()`, `service.Service`
- Produces: `Handler.HostawayWebhook(w, r)` handling POST /webhooks/hostaway

- [ ] **Step 1: Write test for webhook handler**

```go
// webhook_hostaway_test.go
func TestHostawayWebhook_InvalidSignature(t *testing.T) {
    // Setup handler with mock service
    // POST with invalid signature
    // Assert 401 response
}

func TestHostawayWebhook_ReservationCreated(t *testing.T) {
    // Setup handler with mock service
    // POST valid reservation.created payload with valid signature
    // Assert 200 response
    // Assert service.HandleHostawayReservationCreated was called
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && go test ./internal/handler/... -run TestHostawayWebhook -v`
Expected: FAIL — function does not exist

- [ ] **Step 3: Implement webhook_hostaway.go**

Handler reads body, verifies HMAC signature using `hostaway.Client.VerifySignature()`, parses payload, routes by event type (`reservation.created`, `reservation.updated`, `reservation.cancelled`), calls appropriate service method.

- [ ] **Step 4: Add route to router.go**

Add `r.Post("/webhooks/hostaway", h.HostawayWebhook)` after chatwoot webhook route.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && go test ./internal/handler/... -run TestHostawayWebhook -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/internal/handler/webhook_hostaway.go backend/internal/handler/webhook_hostaway_test.go backend/internal/handler/router.go
git commit -m "feat(backend): add Hostaway webhook handler with signature verification"
```

---

## Task 4: Hostaway Sync Service (Go Backend)

**Files:**
- Create: `backend/internal/service/hostaway_sync.go`
- Create: `backend/internal/service/hostaway_sync_test.go`
- Modify: `backend/internal/service/service.go` (add Hostaway client)

**Interfaces:**
- Consumes: `hostaway.Reservation`, `repository.PropertyRepository`, `repository.BookingRepository`
- Produces:
  - `Service.HandleHostawayReservationCreated(ctx, res *hostaway.Reservation) error`
  - `Service.HandleHostawayReservationUpdated(ctx, res *hostaway.Reservation) error`
  - `Service.HandleHostawayReservationCancelled(ctx, res *hostaway.Reservation) error`

- [ ] **Step 1: Write test for reservation created**

```go
// hostaway_sync_test.go
func TestHandleHostawayReservationCreated_CreatesBookingAndJob(t *testing.T) {
    // Setup service with mock repos
    // Property exists with hostaway_id matching reservation.ListingID
    // Call HandleHostawayReservationCreated
    // Assert booking created with correct fields
    // Assert cleaning job created for check_out date
}

func TestHandleHostawayReservationCreated_UnknownProperty(t *testing.T) {
    // Setup service with mock repos
    // No property with matching hostaway_id
    // Call HandleHostawayReservationCreated
    // Assert returns error (logged but not fatal)
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && go test ./internal/service/... -run TestHandleHostaway -v`
Expected: FAIL — function does not exist

- [ ] **Step 3: Implement hostaway_sync.go**

Implement `HandleHostawayReservationCreated`: lookup property by `hostaway_id`, create booking with mapped fields, create cleaning job scheduled for checkout date. Implement update and cancel handlers.

- [ ] **Step 4: Wire Hostaway client into service.go**

Add `hostaway *hostaway.Client` to Service struct, update constructor, add `Hostaway() *hostaway.Client` method.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && go test ./internal/service/... -run TestHandleHostaway -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/internal/service/hostaway_sync.go backend/internal/service/hostaway_sync_test.go backend/internal/service/service.go
git commit -m "feat(backend): add Hostaway sync service for booking/job creation"
```

---

## Task 5: Hostaway API Integration (Next.js)

**Files:**
- Create: `apps/web/src/lib/hostaway.ts`
- Create: `apps/web/src/lib/hostaway.test.ts`
- Modify: `apps/web/.env.example` (add Hostaway env vars)

**Interfaces:**
- Consumes: Environment variables `HOSTAWAY_API_KEY`, `HOSTAWAY_ACCOUNT_ID`, `HOSTAWAY_CHECKOUT_BASE_URL`
- Produces:
  - `getProperties(): Promise<HostawayProperty[]>`
  - `getProperty(id: string): Promise<HostawayProperty>`
  - `getAvailability(listingId: string, startDate: string, endDate: string): Promise<HostawayCalendarDay[]>`
  - `getPricing(listingId: string, checkIn: string, checkOut: string, guests: number): Promise<HostawayPriceQuote>`
  - `getReviews(listingId?: string): Promise<HostawayReview[]>`
  - `buildCheckoutUrl(listingId: string, checkIn: string, checkOut: string, guests: number): string`
  - Types: `HostawayProperty`, `HostawayCalendarDay`, `HostawayPriceQuote`, `HostawayReview`

- [ ] **Step 1: Define TypeScript types**

```typescript
// hostaway.ts
export type HostawayProperty = {
  id: number
  name: string
  description: string
  address: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  basePrice: number
  photos: { url: string; caption?: string }[]
  amenities: string[]
  // ... other fields from Hostaway API
}
```

- [ ] **Step 2: Implement getProperties()**

Fetch from Hostaway `/listings` endpoint with API key header. Handle errors gracefully.

- [ ] **Step 3: Implement getProperty(id)**

Fetch from Hostaway `/listings/{id}` endpoint.

- [ ] **Step 4: Implement getAvailability()**

Fetch from Hostaway `/calendar` endpoint with date range params.

- [ ] **Step 5: Implement getPricing()**

POST to Hostaway `/reservations/price` endpoint.

- [ ] **Step 6: Implement getReviews()**

Fetch from Hostaway `/reviews` endpoint.

- [ ] **Step 7: Implement buildCheckoutUrl()**

Construct URL to Hostaway checkout with query params for property, dates, guests, and return URL.

- [ ] **Step 8: Update .env.example**

```bash
# Hostaway
HOSTAWAY_API_KEY=
HOSTAWAY_ACCOUNT_ID=
HOSTAWAY_CHECKOUT_BASE_URL=
```

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/lib/hostaway.ts apps/web/.env.example
git commit -m "feat(web): add Hostaway API client library"
```

---

## Task 6: Property Listing Page (`/stays/`)

**Files:**
- Create: `apps/web/src/app/stays/page.tsx`
- Create: `apps/web/src/components/PropertyCard.tsx`
- Create: `apps/web/src/components/PropertyFilters.tsx`
- Create: `apps/web/src/components/SearchBar.tsx`

**Interfaces:**
- Consumes: `getProperties()`, `getAvailability()`, `getPricing()` from `lib/hostaway.ts`
- Produces: Server Component page at `/stays/` with property grid, filters, search bar

- [ ] **Step 1: Create SearchBar component**

Client component with check-in, check-out date pickers, guest selector, and search button. Uses URL search params for state.

- [ ] **Step 2: Create PropertyCard component**

Displays property photo carousel, name, rating, specs (beds/baths/sleeps), key amenities, price, CTA button. Accepts `property: HostawayProperty` and optional `price: number`.

- [ ] **Step 3: Create PropertyFilters component**

Client component with dropdowns for bedrooms, amenities (multi-select), price range. Updates URL search params.

- [ ] **Step 4: Create /stays/page.tsx**

Server Component that:
- Reads search params (dates, guests, filters)
- Calls `getProperties()` (cached with ISR)
- If dates provided, calls `getAvailability()` and `getPricing()` for each property
- Filters by amenities/bedrooms client-side
- Renders SearchBar, PropertyFilters, property grid

- [ ] **Step 5: Test manually in browser**

Run: `pnpm --filter web dev`
Navigate to `/stays/`
Expected: Property grid displays, filters work, search updates results

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/stays/ apps/web/src/components/PropertyCard.tsx apps/web/src/components/PropertyFilters.tsx apps/web/src/components/SearchBar.tsx
git commit -m "feat(web): add property listing page with search and filters"
```

---

## Task 7: Property Detail Page (`/stays/[slug]/`)

**Files:**
- Create: `apps/web/src/app/stays/[slug]/page.tsx`
- Create: `apps/web/src/components/PhotoGallery.tsx`
- Create: `apps/web/src/components/BookingCard.tsx`
- Create: `apps/web/src/components/AvailabilityCalendar.tsx`
- Create: `apps/web/src/components/ReviewList.tsx`

**Interfaces:**
- Consumes: `getProperty()`, `getAvailability()`, `getPricing()`, `getReviews()`, `buildCheckoutUrl()` from `lib/hostaway.ts`
- Produces: Server Component page at `/stays/[slug]/` with full property details and booking card

- [ ] **Step 1: Create PhotoGallery component**

Displays hero image with thumbnails grid. "View all photos" opens lightbox modal. Handles empty photos array gracefully.

- [ ] **Step 2: Create AvailabilityCalendar component**

Client component showing two-month calendar view. Blocked dates shaded. Fetches availability via API route.

- [ ] **Step 3: Create BookingCard component**

Client component with date inputs, guest selector, price breakdown (when dates selected), "Book Now" button that redirects to Hostaway checkout URL. Sticky on desktop.

- [ ] **Step 4: Create ReviewList component**

Displays reviews with star rating, guest name, date, text. "Show all" expander.

- [ ] **Step 5: Create /stays/[slug]/page.tsx**

Server Component that:
- Fetches property by ID (from slug mapping or direct ID)
- Fetches reviews (cached with ISR)
- Renders PhotoGallery, property header, two-column layout with content and BookingCard, AvailabilityCalendar, location, ReviewList, house rules, host info
- Generates metadata for SEO

- [ ] **Step 6: Test manually in browser**

Navigate to `/stays/[property-slug]/`
Expected: Full property page renders, booking card works, calendar shows availability

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/stays/[slug]/ apps/web/src/components/PhotoGallery.tsx apps/web/src/components/BookingCard.tsx apps/web/src/components/AvailabilityCalendar.tsx apps/web/src/components/ReviewList.tsx
git commit -m "feat(web): add property detail page with booking card and calendar"
```

---

## Task 8: Booking Confirmation Page

**Files:**
- Create: `apps/web/src/app/book/confirmation/page.tsx`

**Interfaces:**
- Consumes: URL search param `reservation_id`, Hostaway API to fetch reservation details
- Produces: Confirmation page showing booking summary, next steps

- [ ] **Step 1: Create confirmation page**

Server Component that:
- Reads `reservation_id` from search params
- Fetches reservation details from Hostaway API (if available)
- Displays confirmation message, booking summary, check-in info
- Links back to property and content hub

- [ ] **Step 2: Handle missing/invalid reservation_id**

Show generic "Thank you for booking" message if reservation details can't be fetched.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/book/confirmation/
git commit -m "feat(web): add booking confirmation page"
```

---

## Task 9: Homepage Redesign

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/components/RootLayout.tsx` (update nav)
- Create: `apps/web/src/components/HeroSearch.tsx`
- Create: `apps/web/src/components/PropertyShowcase.tsx`
- Create: `apps/web/src/components/WhyBookDirect.tsx`
- Create: `apps/web/src/components/ReviewCarousel.tsx`
- Create: `apps/web/src/components/NewsletterSignup.tsx`

**Interfaces:**
- Consumes: `getProperties()`, `getReviews()` from `lib/hostaway.ts`
- Produces: Guest-first homepage with search bar, property showcase, trust signals

- [ ] **Step 1: Create HeroSearch component**

Full-viewport hero with background image, headline "Your mountain escape. Book direct. Save more.", inline SearchBar component.

- [ ] **Step 2: Create PropertyShowcase component**

Grid of 4 featured PropertyCards with "View all properties" link to `/stays/`.

- [ ] **Step 3: Create WhyBookDirect component**

Four benefit cards: best price guarantee, direct communication, flexible cancellation, local hosts. Link to `/why-book-direct/`.

- [ ] **Step 4: Create ReviewCarousel component**

Horizontal scroll carousel of guest reviews pulled from Hostaway.

- [ ] **Step 5: Create NewsletterSignup component**

Email input with Server Action for subscription. Headline: "Get Mount Washington updates & exclusive offers".

- [ ] **Step 6: Update page.tsx**

Replace existing homepage with: HeroSearch, PropertyShowcase, WhyBookDirect, ReviewCarousel, content hub teaser (3 category cards linking to /mount-washington/), NewsletterSignup.

- [ ] **Step 7: Update RootLayout.tsx navigation**

Update `headerLinks` to include "Stays" linking to `/stays/`, "Mount Washington" linking to `/mount-washington/`.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/RootLayout.tsx apps/web/src/components/HeroSearch.tsx apps/web/src/components/PropertyShowcase.tsx apps/web/src/components/WhyBookDirect.tsx apps/web/src/components/ReviewCarousel.tsx apps/web/src/components/NewsletterSignup.tsx
git commit -m "feat(web): redesign homepage for direct booking with search and property showcase"
```

---

## Task 10: Newsletter Subscription Action

**Files:**
- Modify: `apps/web/src/lib/actions.ts`
- Create: `backend/migrations/000015_create_newsletter_subscribers.up.sql`
- Create: `backend/migrations/000015_create_newsletter_subscribers.down.sql`

**Interfaces:**
- Consumes: FormData with `email` field
- Produces: `subscribeToNewsletter(formData: FormData): Promise<{success: boolean; message: string}>`

- [ ] **Step 1: Create newsletter_subscribers table migration**

```sql
-- up
CREATE TABLE newsletter_subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    source TEXT DEFAULT 'website'
);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- down
DROP TABLE IF EXISTS newsletter_subscribers;
```

- [ ] **Step 2: Add Server Action to actions.ts**

```typescript
export async function subscribeToNewsletter(
  _prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = String(formData.get('email') ?? '').trim()
  // Validate email
  // Store in database or send to Resend audience
  // Return success/error
}
```

- [ ] **Step 3: Run migration**

Run: `cd backend && migrate -path migrations -database $DATABASE_URL up`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/actions.ts backend/migrations/000015_create_newsletter_subscribers.*
git commit -m "feat: add newsletter subscription with database storage"
```

---

## Task 11: Content Hub Structure (`/mount-washington/`)

**Files:**
- Create: `apps/web/src/app/mount-washington/page.tsx`
- Create: `apps/web/src/app/mount-washington/[category]/page.tsx`
- Create: `apps/web/src/app/mount-washington/[slug]/page.tsx`
- Create: `apps/web/src/lib/content.ts`
- Create: `apps/web/src/content/mount-washington/.gitkeep`

**Interfaces:**
- Consumes: MDX files from `content/mount-washington/`
- Produces: Content hub landing page, category pages, individual guide pages

- [ ] **Step 1: Create content.ts utilities**

Functions to scan MDX files, parse frontmatter, list by category, get by slug.

- [ ] **Step 2: Create hub landing page**

Server Component with hero "Discover Mount Washington", category cards (skiing, summer, families, getting-here, first-time-visitors), latest guides section, CTA to `/stays/`.

- [ ] **Step 3: Create category page**

Lists all guides in category with title, description, publish date.

- [ ] **Step 4: Create guide page**

Renders MDX content with property CTA at bottom.

- [ ] **Step 5: Create .gitkeep for content directory**

Placeholder so directory structure exists.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/mount-washington/ apps/web/src/lib/content.ts apps/web/src/content/
git commit -m "feat(web): add Mount Washington content hub structure"
```

---

## Task 12: Service Landing Pages

**Files:**
- Create: `apps/web/src/app/cleaning/page.tsx`
- Create: `apps/web/src/app/why-book-direct/page.tsx`
- Modify: `apps/web/src/components/Footer.tsx` (add new links)

**Interfaces:**
- Consumes: Existing page patterns and components
- Produces: `/cleaning/` and `/why-book-direct/` pages

- [ ] **Step 1: Create /cleaning/ page**

Hero: "Professional cleaning for vacation properties"
Sections: Services (turnover, deep cleaning, linen, restocking), How it works (3 steps), CTA (Get a quote → contact form)

- [ ] **Step 2: Create /why-book-direct/ page**

Hero: "Why book direct with us?"
Sections: Best price guarantee, direct communication, flexible policies, local hosts, secure booking explanation, FAQs
CTA: Browse properties

- [ ] **Step 3: Update Footer.tsx**

Add "Stays" and "Cleaning" links to Services section. Add "Mount Washington" to Company section.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/cleaning/ apps/web/src/app/why-book-direct/ apps/web/src/components/Footer.tsx
git commit -m "feat(web): add cleaning service and why-book-direct pages, update footer"
```

---

## Task 13: API Routes for Real-Time Data

**Files:**
- Create: `apps/web/src/app/api/hostaway/availability/route.ts`
- Create: `apps/web/src/app/api/hostaway/pricing/route.ts`

**Interfaces:**
- Consumes: `getAvailability()`, `getPricing()` from `lib/hostaway.ts`
- Produces: API routes for client-side fetching of real-time availability and pricing

- [ ] **Step 1: Create availability API route**

```typescript
// GET /api/hostaway/availability?listingId=X&startDate=Y&endDate=Z
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  // Validate params
  // Call getAvailability()
  // Return JSON response
}
```

- [ ] **Step 2: Create pricing API route**

```typescript
// GET /api/hostaway/pricing?listingId=X&checkIn=Y&checkOut=Z&guests=N
export async function GET(request: Request) {
  // Validate params
  // Call getPricing()
  // Return JSON response with price breakdown
}
```

- [ ] **Step 3: Add error handling**

Return appropriate error responses for missing params, API failures, rate limiting.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/api/hostaway/
git commit -m "feat(web): add API routes for real-time availability and pricing"
```

---

## Task 14: Environment and Configuration

**Files:**
- Modify: `backend/.env.example`
- Modify: `backend/internal/config/config.go`
- Modify: `backend/cmd/server/main.go`

**Interfaces:**
- Consumes: Environment variables
- Produces: Hostaway configuration loaded into Go backend

- [ ] **Step 1: Update backend/.env.example**

```bash
# Hostaway
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
HOSTAWAY_API_KEY=
HOSTAWAY_ACCOUNT_ID=
HOSTAWAY_WEBHOOK_SECRET=
```

- [ ] **Step 2: Update config.go**

Add Hostaway config fields to Config struct and load from environment.

- [ ] **Step 3: Update main.go**

Initialize Hostaway client with config and pass to service.

- [ ] **Step 4: Commit**

```bash
git add backend/.env.example backend/internal/config/config.go backend/cmd/server/main.go
git commit -m "feat(backend): add Hostaway configuration to backend"
```

---

## Task 15: Update Domain Entities

**Files:**
- Modify: `backend/internal/domain/entities.go`

**Interfaces:**
- Consumes: Existing `Property` and `Booking` structs
- Produces: Updated structs with `HostawayID` and `ExternalID` fields

- [ ] **Step 1: Add HostawayID to Property struct**

```go
type Property struct {
    // ... existing fields
    HostawayID *string `json:"hostaway_id,omitempty" db:"hostaway_id"`
}
```

- [ ] **Step 2: Add ExternalID to Booking struct**

```go
type Booking struct {
    // ... existing fields
    ExternalID *string `json:"external_id,omitempty" db:"external_id"`
}
```

- [ ] **Step 3: Add 'hostaway' to BookingSource enum**

```go
const (
    // ... existing
    BookingSourceHostaway BookingSource = "hostaway"
)
```

- [ ] **Step 4: Commit**

```bash
git add backend/internal/domain/entities.go
git commit -m "feat(backend): add Hostaway fields to Property and Booking entities"
```

---

## Task 16: Final Integration Test

**Files:**
- No new files — manual testing

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified end-to-end flow

- [ ] **Step 1: Start backend with Hostaway config**

```bash
cd backend && go run ./cmd/server
```
Verify: Server starts, /health returns 200

- [ ] **Step 2: Start frontend**

```bash
pnpm --filter web dev
```
Verify: Homepage loads with new design

- [ ] **Step 3: Test property listing**

Navigate to `/stays/`
Verify: Properties load from Hostaway API, filters work

- [ ] **Step 4: Test property detail page**

Click a property card
Verify: Full property page loads, calendar shows availability

- [ ] **Step 5: Test booking flow**

Select dates and guests, click "Book Now"
Verify: Redirects to Hostaway checkout URL with correct params

- [ ] **Step 6: Test webhook (with mock)**

POST to `/webhooks/hostaway` with valid signature and reservation.created payload
Verify: 200 response, booking and cleaning job created in database

- [ ] **Step 7: Test content hub**

Navigate to `/mount-washington/`
Verify: Hub page loads, category structure works

- [ ] **Step 8: Test newsletter signup**

Submit email in footer form
Verify: Success message, record in database

- [ ] **Step 9: Commit any final fixes**

```bash
git add -A
git commit -m "fix: address integration test findings"
```
