# Direct Booking Platform Design Spec

> **Date:** 2026-09-29
> **Status:** Draft
> **Author:** Max (UbiShip)

## Overview

Transform the Strathcona Summit Solutions website from a brochure-style marketing site into a direct-booking and customer-acquisition platform. Guests discover properties, check availability, and book directly through the SSS website, with Hostaway powering the reservation infrastructure behind the scenes.

### Goals

1. **Primary:** Enable guests to search, browse, and book Mount Washington vacation rentals directly on strathconasummit.ca
2. **Secondary:** Establish SEO presence through destination content hub
3. **Secondary:** Maintain clear pathways for non-guest audiences (property owners, cleaning clients, renovation clients)

### Non-Goals

- Building custom payment processing (use Hostaway checkout)
- Replacing Hostaway as the PMS (it remains source of truth)
- Full content library at launch (structure now, content later)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST-FACING WEBSITE                     │
│                (Next.js on Vercel - apps/web)               │
├─────────────────────────────────────────────────────────────┤
│  Property Search  │  Property Pages  │  Availability/Price  │
│        ↓                  ↓                    ↓             │
│              Hostaway API (direct queries)                  │
│                           ↓                                 │
│              Hostaway Checkout (redirect)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                    Booking Created
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  HOSTAWAY WEBHOOKS                          │
│              reservation.created / updated                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GO BACKEND                               │
│              (Internal Operations)                          │
├─────────────────────────────────────────────────────────────┤
│  • Sync booking → create CleaningJob                        │
│  • Property metadata (tier, owner, payout rules)            │
│  • Staff timesheets, job tracking                           │
│  • Payout calculations                                      │
│  • Chatwoot/Novu integrations                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Principle

- **Hostaway** is the source of truth for properties, availability, pricing, and bookings
- **Website** queries Hostaway API for guest-facing data
- **Go backend** listens to Hostaway webhooks for operational triggers (cleaning jobs, payouts)
- **Checkout** redirects to Hostaway's hosted checkout (PCI-compliant, payment handling)

---

## Site Architecture & Routes

```
strathconasummit.ca/
│
├── /                           # Homepage (guest-first, booking-focused)
├── /stays/                     # Property listing with search/filters
├── /stays/[slug]/              # Individual property pages
│
├── /mount-washington/          # Content hub (destination guides)
│   ├── /mount-washington/[slug]/   # Individual guide pages
│   └── (categories: skiing, summer, families, getting-here, etc.)
│
├── /book/                      # Booking flow entry (redirects to Hostaway)
├── /book/confirmation/         # Return page after successful booking
│
├── /property-management/       # Service: owners looking for PM
├── /cleaning/                  # Service: cleaning clients
├── /renovations/               # Service: renovation clients
│
├── /about/                     # Team, story, trust signals
├── /contact/                   # Contact form
├── /why-book-direct/           # Trust-building: why book direct explanation
│
└── /blog/                      # General blog/news (lower priority)
```

### URL Decisions

- `/stays/` for guest-facing properties (not `/properties/` which sounds owner-facing)
- `/mount-washington/` for SEO content hub
- Service pages remain separate, not competing with guest experience
- `/why-book-direct/` dedicated trust-building page

---

## Homepage Design

Mobile-first, conversion-focused layout following direct-booking best practices.

### Structure

1. **Header** — Logo, Stays, Mount Washington, About, Contact, Book CTA
2. **Hero** (full viewport)
   - Exceptional Mount Washington image
   - Guest-focused headline: "Your mountain escape. Book direct. Save more."
   - Inline search bar: [Check-in] [Check-out] [Guests] [Search]
3. **Property Showcase**
   - "Explore our Mount Washington properties"
   - Property card grid (4 featured)
   - "View all properties" link
4. **Why Book Direct**
   - Best price guarantee, direct communication, flexible cancellation, local hosts
   - Link to /why-book-direct/
5. **Trust Signals**
   - "What our guests say"
   - Review carousel (pulled from Hostaway)
6. **Discover Mount Washington**
   - Content hub teaser (3 category cards)
   - "Explore Mount Washington" link
7. **Newsletter**
   - "Get Mount Washington updates & exclusive offers"
   - Email input + Subscribe button
8. **Footer**
   - Logo, Stays, Property Management, Cleaning, Renovations
   - About, Contact, Privacy, Terms

### Key Elements

- Hero search bar is primary action (not separate page)
- Properties appear high on homepage
- "Why Book Direct" answers the key guest question
- Reviews provide social proof
- Service links in footer/nav, not competing on homepage

---

## Property Listing Page (`/stays/`)

### Structure

1. **Search Bar** (pre-filled if from homepage)
   - Check-in, Check-out, Guests, Update Search
2. **Filters Bar**
   - Bedrooms dropdown
   - Amenities dropdown (hot tub, ski-in/out, pet-friendly, fireplace, washer/dryer)
   - Price range dropdown
   - Clear filters
3. **Results Header**
   - "X properties available"
   - Sort dropdown (Recommended, Price low-high, Price high-low)
4. **Property Grid**
   - Photo carousel with dots
   - Property name
   - Star rating + review count
   - Specs: beds, baths, sleeps
   - Key amenities (icons)
   - "From $X/night" or actual price if dates selected
   - "Check Availability" button
5. **No Results State**
   - Adjust dates/filters message
   - Clear filters button
   - Contact us fallback

### Behavior

- **No dates selected:** Show all properties with base "From $X/night" pricing
- **Dates selected:** Show only available properties with calculated prices
- **Mobile:** Single column, sticky search, bottom sheet filters

---

## Property Detail Page (`/stays/[slug]/`)

### Structure

1. **Photo Gallery**
   - Hero image (large) + 4 thumbnails
   - "View all photos" opens lightbox/gallery
2. **Property Header**
   - Name, star rating, review count, location
   - Specs: bedrooms, bathrooms, sleeps
3. **Two-Column Layout** (desktop)
   - **Main content** (left):
     - Highlights (key amenities with icons)
     - About this property (expandable description)
     - Full amenities list (grouped by category)
     - Sleeping arrangements
   - **Booking card** (right, sticky):
     - "From $X/night"
     - Date inputs, guest selector
     - Price breakdown (when dates selected)
     - "Check Availability" / "Book Now" button
     - Trust badges: "Best price direct", "Free cancellation"
4. **Availability Calendar**
   - Two-month view
   - Blocked dates shaded
   - Minimum stay noted
5. **Location**
   - Mount Washington Alpine Resort
   - Distance to lifts, drive times from cities
6. **Reviews**
   - Average rating, review count
   - Individual reviews with name, date, text
   - "Show all X reviews" expander
7. **House Rules & Policies**
   - Check-in/out times
   - Rules (no smoking, pets, etc.)
   - Cancellation policy
8. **Your Host**
   - SSS logo, description, response time
   - "Contact host" button
9. **Mobile Sticky Bar**
   - "From $X/night" + "Check Availability" button (bottom of screen)

### Behavior

- Booking card sticky on desktop scroll
- "Book Now" redirects to Hostaway checkout with property + dates pre-filled
- Calendar shows real-time availability from Hostaway
- Reviews pulled from Hostaway API

---

## Hostaway Integration

### API Endpoints Used

| Purpose | Hostaway Endpoint | Caching |
|---------|-------------------|---------|
| List properties | GET /listings | ISR (1 hour) |
| Property details | GET /listings/{id} | ISR (1 hour) |
| Property photos | GET /listings/{id}/photos | ISR (1 hour) |
| Availability | GET /calendar | Real-time |
| Price quote | POST /reservations/price | Real-time |
| Reviews | GET /reviews | ISR (6 hours) |

### Next.js API Routes

```
/api/hostaway/properties      → Proxy to Hostaway listings
/api/hostaway/availability    → Proxy to Hostaway calendar
/api/hostaway/pricing         → Proxy to Hostaway price calculator
/api/hostaway/reviews         → Proxy to Hostaway reviews
```

These routes:
- Keep API credentials server-side
- Add rate limiting
- Handle errors gracefully

### Checkout Flow

1. Guest selects dates + guests on property page
2. Clicks "Book Now"
3. Next.js builds Hostaway checkout URL with parameters:
   - Property ID
   - Check-in / Check-out dates
   - Number of guests
   - Return URL (`/book/confirmation`)
4. Guest redirected to Hostaway checkout
5. Guest completes booking + payment
6. Hostaway redirects to `/book/confirmation?reservation_id=XXX`
7. Confirmation page fetches reservation details from Hostaway API

### Environment Variables

```bash
# Server-side
HOSTAWAY_API_KEY=
HOSTAWAY_ACCOUNT_ID=
HOSTAWAY_CHECKOUT_BASE_URL=   # e.g., https://yoursite.holidayfuture.com

# Public
NEXT_PUBLIC_SITE_URL=https://strathconasummit.ca
```

---

## Backend Webhook Handler (Go)

### Webhook Endpoint

```
POST /webhooks/hostaway
```

### Flow

1. Verify webhook signature (HMAC)
2. Parse event type
3. Handle event:
   - `reservation.created` → Create Booking + CleaningJob
   - `reservation.updated` → Update Booking + CleaningJob
   - `reservation.cancelled` → Cancel Booking + CleaningJob
4. Map Hostaway property ID → internal Property ID
5. Store/update in PostgreSQL
6. Trigger notifications via Novu (if applicable)

### Data Mapping

| Hostaway Field | Go Backend Field |
|----------------|------------------|
| `reservation.id` | `Booking.external_id` |
| `reservation.listingId` | `Property.hostaway_id` → `Property.id` |
| `reservation.checkInDate` | `Booking.check_in` |
| `reservation.checkOutDate` | `Booking.check_out` |
| `reservation.guestName` | `Booking.guest_name` |
| `reservation.totalPrice` | `Booking.total_amount` |
| `reservation.source` | `Booking.source` |

### New Files

```
backend/internal/
├── integrations/
│   └── hostaway/
│       ├── client.go       # Hostaway API client
│       ├── webhook.go      # Webhook payload parsing
│       └── types.go        # Hostaway data structures
├── handler/
│   └── webhook_hostaway.go # POST /webhooks/hostaway handler
└── service/
    └── hostaway_sync.go    # Business logic for booking sync
```

### Database Migration

```sql
ALTER TABLE properties ADD COLUMN hostaway_id TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN external_id TEXT UNIQUE;
ALTER TABLE bookings ADD COLUMN source TEXT DEFAULT 'direct';
```

---

## Content Hub (`/mount-washington/`)

### Route Structure

```
/mount-washington/                        # Hub landing page
/mount-washington/skiing/                 # Category page
/mount-washington/summer/                 # Category page
/mount-washington/families/               # Category page
/mount-washington/getting-here/           # Category page
/mount-washington/first-time-visitors/    # Category page
/mount-washington/[slug]/                 # Individual guide
```

### Hub Landing Page Structure

1. **Hero** — "Discover Mount Washington"
2. **Category Cards** — Visual links to each category
3. **Latest Guides** — Recent articles across categories
4. **CTA** — "Book your stay" link to /stays/

### Technical Implementation

```
apps/web/src/
├── app/mount-washington/
│   ├── page.tsx                    # Hub landing
│   ├── [category]/
│   │   └── page.tsx                # Category listing
│   └── [slug]/
│       └── page.tsx                # Individual guide
│
├── content/mount-washington/       # MDX content files
│   ├── skiing/
│   │   └── *.mdx
│   ├── summer/
│   │   └── *.mdx
│   └── ...
│
└── lib/content.ts                  # Content fetching utilities
```

### Content Format

- **MDX files** with frontmatter (title, description, category, publishedAt)
- File-based (no CMS needed initially)
- Each guide ends with property CTA

---

## Lead Capture

### Newsletter Signup

Placement:
- Homepage (dedicated section)
- Footer (all pages)
- Content hub (end of articles)

```
"Get Mount Washington updates & exclusive offers"
[Email address] [Subscribe]
```

Implementation:
- Server Action posts to email provider
- Store in `newsletter_subscribers` table
- Use Resend (already in stack) with audience lists

---

## Analytics

### Tools

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Performance, core web vitals |
| Google Analytics 4 | Traffic, user journeys, conversions |
| Hostaway | Booking attribution |

### Conversion Events

- `search_performed` — Dates/guests entered
- `property_viewed` — Property page visit
- `availability_checked` — Clicked "Check Availability"
- `booking_started` — Redirected to Hostaway checkout
- `booking_completed` — Returned to confirmation page

---

## Service Landing Pages

### Property Management (`/property-management/`)

- Hero: "Full-service property management for Mount Washington"
- What we handle: Guest comms, revenue optimization, cleaning, maintenance, payouts
- Service tiers (optional)
- Why owners choose us
- Owner testimonials
- CTA: Schedule consultation

### Cleaning Services (`/cleaning/`)

- Hero: "Professional cleaning for vacation properties"
- Services: Turnover, deep cleaning, linen, restocking
- How it works
- CTA: Get a quote

### Renovations (`/renovations/`)

- Existing page structure maintained

---

## Phase 1 Scope

### Included

- Homepage redesign (guest-first, search bar, property showcase)
- `/stays/` listing page with filters
- `/stays/[slug]/` property detail pages
- Hostaway API integration (properties, availability, pricing, reviews)
- Hostaway checkout redirect flow
- `/book/confirmation/` return page
- Go backend webhook handler for Hostaway
- Content hub structure (`/mount-washington/`) — empty, ready for content
- Newsletter signup (homepage, footer)
- `/why-book-direct/` page
- `/cleaning/` service page
- Updated navigation and footer

### Excluded (Future Phases)

- Actual content for Mount Washington guides
- Property alerts ("notify me when available")
- Map integration
- Advanced search (e.g., "pet-friendly ski-in properties")
- Owner portal
- Linen service page

---

## Dependencies

### External

- Hostaway API access and credentials
- Hostaway webhook configuration
- Property data in Hostaway (photos, descriptions, amenities, pricing)

### Internal

- `hostaway_id` column added to properties table
- Properties created in Go backend with matching Hostaway IDs

---

## Open Questions

None — all design decisions confirmed during brainstorming session.
