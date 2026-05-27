# Database Migrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create PostgreSQL migrations for Core + PM domain tables and run them against the Railway database.

**Architecture:** Six logical migrations using golang-migrate: enums, core tables, properties, bookings, service tracking, indexes. Each migration has up/down files. After migrations run, update Go domain entities to match schema exactly.

**Tech Stack:** PostgreSQL 15, golang-migrate, pgx/v5

---

## File Structure

**Files to create:**
```
backend/migrations/
├── 000001_enums.up.sql
├── 000001_enums.down.sql
├── 000002_core.up.sql
├── 000002_core.down.sql
├── 000003_properties.up.sql
├── 000003_properties.down.sql
├── 000004_bookings.up.sql
├── 000004_bookings.down.sql
├── 000005_service_tracking.up.sql
├── 000005_service_tracking.down.sql
├── 000006_indexes.up.sql
├── 000006_indexes.down.sql
```

**Files to modify:**
```
backend/internal/domain/entities.go  # Update to match schema exactly
```

---

## Task 1: Migration 000001 - Enums

**Files:**
- Create: `backend/migrations/000001_enums.up.sql`
- Create: `backend/migrations/000001_enums.down.sql`

- [ ] **Step 1: Create enums up migration**

Create file `backend/migrations/000001_enums.up.sql`:

```sql
-- 000001_enums.up.sql
-- All enum types for Core + PM domain

CREATE TYPE user_role AS ENUM (
    'admin',
    'cleaner',
    'cleaning_client',
    'pm_owner',
    'renovation_client',
    'subtrade',
    'bookkeeper'
);

CREATE TYPE service_tier AS ENUM ('1', '2', '3');

CREATE TYPE booking_source AS ENUM (
    'airbnb',
    'vrbo',
    'direct',
    'owner_use',
    'platform'
);

CREATE TYPE tax_treatment AS ENUM (
    'airbnb_managed',
    'direct',
    'none'
);

CREATE TYPE service_line_type AS ENUM (
    'cleaning',
    'laundry',
    'shoveling',
    'maintenance',
    'purchase',
    'restock'
);

CREATE TYPE tax_type AS ENUM (
    'gst_only',
    'gst_pst',
    'gst_pst_mrdt',
    'none'
);

CREATE TYPE statement_status AS ENUM ('draft', 'sent', 'paid');

CREATE TYPE job_status AS ENUM (
    'assigned',
    'in_progress',
    'complete',
    'flagged'
);

CREATE TYPE comp_model AS ENUM ('hourly', 'per_job');

CREATE TYPE photo_visibility AS ENUM ('internal', 'owner', 'public');

CREATE TYPE agreement_type AS ENUM (
    'cleaning',
    'pm',
    'renovation_fixed',
    'renovation_cost_plus',
    'renovation_t_and_m'
);
```

- [ ] **Step 2: Create enums down migration**

Create file `backend/migrations/000001_enums.down.sql`:

```sql
-- 000001_enums.down.sql

DROP TYPE IF EXISTS agreement_type;
DROP TYPE IF EXISTS photo_visibility;
DROP TYPE IF EXISTS comp_model;
DROP TYPE IF EXISTS job_status;
DROP TYPE IF EXISTS statement_status;
DROP TYPE IF EXISTS tax_type;
DROP TYPE IF EXISTS service_line_type;
DROP TYPE IF EXISTS tax_treatment;
DROP TYPE IF EXISTS booking_source;
DROP TYPE IF EXISTS service_tier;
DROP TYPE IF EXISTS user_role;
```

- [ ] **Step 3: Commit migration 1**

```bash
git add backend/migrations/000001_enums.up.sql backend/migrations/000001_enums.down.sql
git commit -m "feat(db): add migration 000001 - enum types"
```

---

## Task 2: Migration 000002 - Core Tables

**Files:**
- Create: `backend/migrations/000002_core.up.sql`
- Create: `backend/migrations/000002_core.down.sql`

- [ ] **Step 1: Create core up migration**

Create file `backend/migrations/000002_core.up.sql`:

```sql
-- 000002_core.up.sql
-- Core tables: contacts, users + shared trigger function

-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- contacts: all people in the system
CREATE TABLE contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE,
    phone text,
    company_name text,
    role user_role NOT NULL,
    notes text,
    chatwoot_contact_id bigint UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- users: authentication accounts
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role user_role NOT NULL,
    refresh_token_hash text,
    refresh_token_expires_at timestamptz,
    last_login_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Create core down migration**

Create file `backend/migrations/000002_core.down.sql`:

```sql
-- 000002_core.down.sql

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS contacts;
DROP FUNCTION IF EXISTS update_updated_at();
```

- [ ] **Step 3: Commit migration 2**

```bash
git add backend/migrations/000002_core.up.sql backend/migrations/000002_core.down.sql
git commit -m "feat(db): add migration 000002 - contacts and users tables"
```

---

## Task 3: Migration 000003 - Properties

**Files:**
- Create: `backend/migrations/000003_properties.up.sql`
- Create: `backend/migrations/000003_properties.down.sql`

- [ ] **Step 1: Create properties up migration**

Create file `backend/migrations/000003_properties.up.sql`:

```sql
-- 000003_properties.up.sql
-- Property management tables

-- checklist_templates: reusable cleaning checklists
CREATE TABLE checklist_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    rooms jsonb NOT NULL DEFAULT '{"rooms": []}',
    version int NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER checklist_templates_updated_at
    BEFORE UPDATE ON checklist_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- properties: managed vacation rental properties
CREATE TABLE properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    tier service_tier NOT NULL,
    commission_rate numeric(5,4) NOT NULL DEFAULT 0.20,
    cleaning_fee numeric(10,2) NOT NULL DEFAULT 300.00,
    cleaning_fee_commissionable boolean NOT NULL DEFAULT false,
    airbnb_ical_url text,
    vrbo_ical_url text,
    wifi_password text,
    access_codes jsonb,
    hot_tub boolean NOT NULL DEFAULT false,
    hot_tub_temp_f int DEFAULT 104,
    notes text,
    supply_list jsonb,
    checklist_template_id uuid REFERENCES checklist_templates(id),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- property_owners: junction table for ownership (supports co-ownership)
CREATE TABLE property_owners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    equity_share numeric(5,4) NOT NULL DEFAULT 1.0,
    portal_access boolean NOT NULL DEFAULT false,
    statement_email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(property_id, contact_id)
);

CREATE TRIGGER property_owners_updated_at
    BEFORE UPDATE ON property_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- service_agreements: contracts between SS and property owners
CREATE TABLE service_agreements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tier service_tier NOT NULL,
    type agreement_type NOT NULL,
    monthly_rate numeric(10,2),
    commission_rate numeric(5,4),
    effective_date date NOT NULL,
    expiry_date date,
    dropbox_sign_id text,
    signed_at timestamptz,
    document_key text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER service_agreements_updated_at
    BEFORE UPDATE ON service_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Create properties down migration**

Create file `backend/migrations/000003_properties.down.sql`:

```sql
-- 000003_properties.down.sql

DROP TABLE IF EXISTS service_agreements;
DROP TABLE IF EXISTS property_owners;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS checklist_templates;
```

- [ ] **Step 3: Commit migration 3**

```bash
git add backend/migrations/000003_properties.up.sql backend/migrations/000003_properties.down.sql
git commit -m "feat(db): add migration 000003 - properties and related tables"
```

---

## Task 4: Migration 000004 - Bookings

**Files:**
- Create: `backend/migrations/000004_bookings.up.sql`
- Create: `backend/migrations/000004_bookings.down.sql`

- [ ] **Step 1: Create bookings up migration**

Create file `backend/migrations/000004_bookings.up.sql`:

```sql
-- 000004_bookings.up.sql
-- Booking and cleaning job tables

-- cleaning_jobs: created first (bookings will reference it)
CREATE TABLE cleaning_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    -- booking_id added via ALTER after bookings table exists
    scheduled_date date NOT NULL,
    scheduled_time time,
    status job_status NOT NULL DEFAULT 'assigned',
    comp_model comp_model NOT NULL DEFAULT 'hourly',
    job_rate numeric(10,2),
    duration_hours numeric(5,2),
    arrived_at timestamptz,
    completed_at timestamptz,
    checklist_data jsonb,
    hot_tub_photo_required boolean NOT NULL DEFAULT false,
    hot_tub_status text,
    damage_notes text,
    restock_notes text,
    internal_notes text,
    dispatched_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER cleaning_jobs_updated_at
    BEFORE UPDATE ON cleaning_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- bookings: guest reservations
CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    source booking_source NOT NULL,
    tax_treatment tax_treatment NOT NULL,
    external_uid text UNIQUE,
    guest_name text,
    guest_email text,
    guest_phone text,
    check_in date NOT NULL,
    check_out date NOT NULL,
    nights int GENERATED ALWAYS AS (check_out - check_in) STORED,
    nightly_rate numeric(10,2),
    nightly_rate_weekend numeric(10,2),
    nightly_rate_holiday numeric(10,2),
    revenue_incl_cleaning_fee numeric(10,2),
    revenue_excl_cleaning_fee numeric(10,2),
    cleaning_fee_charged numeric(10,2),
    gst numeric(10,2) NOT NULL DEFAULT 0,
    pst numeric(10,2) NOT NULL DEFAULT 0,
    mrdt numeric(10,2) NOT NULL DEFAULT 0,
    notes text,
    cleaning_job_id uuid REFERENCES cleaning_jobs(id),
    -- statement_id added via ALTER after owner_statements table exists
    chatwoot_conversation_id bigint,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Now add the back-reference from cleaning_jobs to bookings
ALTER TABLE cleaning_jobs ADD COLUMN booking_id uuid REFERENCES bookings(id);

-- cleaning_job_staff: junction table for staff assignments
CREATE TABLE cleaning_job_staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    hours_logged numeric(5,2),
    hourly_rate numeric(10,2),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(job_id, contact_id)
);

CREATE TRIGGER cleaning_job_staff_updated_at
    BEFORE UPDATE ON cleaning_job_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Create bookings down migration**

Create file `backend/migrations/000004_bookings.down.sql`:

```sql
-- 000004_bookings.down.sql

DROP TABLE IF EXISTS cleaning_job_staff;
ALTER TABLE cleaning_jobs DROP COLUMN IF EXISTS booking_id;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS cleaning_jobs;
```

- [ ] **Step 3: Commit migration 4**

```bash
git add backend/migrations/000004_bookings.up.sql backend/migrations/000004_bookings.down.sql
git commit -m "feat(db): add migration 000004 - bookings and cleaning jobs"
```

---

## Task 5: Migration 000005 - Service Tracking

**Files:**
- Create: `backend/migrations/000005_service_tracking.up.sql`
- Create: `backend/migrations/000005_service_tracking.down.sql`

- [ ] **Step 1: Create service tracking up migration**

Create file `backend/migrations/000005_service_tracking.up.sql`:

```sql
-- 000005_service_tracking.up.sql
-- Owner statements, service lines, photos

-- owner_statements: monthly payout statements for property owners
CREATE TABLE owner_statements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    property_owner_id uuid NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_revenue_incl_fee numeric(10,2),
    total_revenue_excl_fee numeric(10,2),
    commission_rate numeric(5,4),
    commission_total numeric(10,2),
    gst_collected numeric(10,2),
    pst_collected numeric(10,2),
    mrdt_collected numeric(10,2),
    expenses_cleaning numeric(10,2),
    expenses_laundry numeric(10,2),
    expenses_shoveling numeric(10,2),
    expenses_maintenance numeric(10,2),
    expenses_purchases numeric(10,2),
    expenses_total numeric(10,2),
    owner_payout_net numeric(10,2),
    status statement_status NOT NULL DEFAULT 'draft',
    pdf_key text,
    sent_at timestamptz,
    qbo_invoice_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER owner_statements_updated_at
    BEFORE UPDATE ON owner_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add statement_id FK to bookings now that owner_statements exists
ALTER TABLE bookings ADD COLUMN statement_id uuid REFERENCES owner_statements(id);

-- service_lines: billable line items (cleaning, laundry, purchases, etc.)
CREATE TABLE service_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES bookings(id),
    statement_id uuid REFERENCES owner_statements(id),
    type service_line_type NOT NULL,
    date date NOT NULL,
    description text,
    quantity numeric(8,2) NOT NULL,
    rate numeric(10,2) NOT NULL,
    markup_rate numeric(5,4) NOT NULL DEFAULT 0,
    -- Generated columns for tax calculations
    -- subtotal = quantity * rate * (1 + markup_rate)
    subtotal numeric(10,2) GENERATED ALWAYS AS (
        quantity * rate * (1 + markup_rate)
    ) STORED,
    tax_type tax_type NOT NULL,
    -- GST = 5% of subtotal for all types
    gst numeric(10,2) GENERATED ALWAYS AS (
        quantity * rate * (1 + markup_rate) * 0.05
    ) STORED,
    -- PST = 7% of subtotal only for purchase/restock (gst_pst type)
    pst numeric(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN tax_type = 'gst_pst' THEN quantity * rate * (1 + markup_rate) * 0.07
            ELSE 0
        END
    ) STORED,
    -- total = subtotal + gst + pst
    total numeric(10,2) GENERATED ALWAYS AS (
        quantity * rate * (1 + markup_rate) * 1.05 +
        CASE
            WHEN tax_type = 'gst_pst' THEN quantity * rate * (1 + markup_rate) * 0.07
            ELSE 0
        END
    ) STORED,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER service_lines_updated_at
    BEFORE UPDATE ON service_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- photos: uploaded images for jobs and projects
CREATE TABLE photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid REFERENCES cleaning_jobs(id) ON DELETE SET NULL,
    project_id uuid, -- Reserved for renovations domain, no FK yet
    uploaded_by uuid NOT NULL REFERENCES contacts(id),
    bucket text NOT NULL,
    storage_key text NOT NULL,
    content_type text NOT NULL DEFAULT 'image/jpeg',
    size_bytes bigint,
    visibility photo_visibility NOT NULL DEFAULT 'internal',
    room text,
    caption text,
    taken_at timestamptz,
    is_required boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Create service tracking down migration**

Create file `backend/migrations/000005_service_tracking.down.sql`:

```sql
-- 000005_service_tracking.down.sql

DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS service_lines;
ALTER TABLE bookings DROP COLUMN IF EXISTS statement_id;
DROP TABLE IF EXISTS owner_statements;
```

- [ ] **Step 3: Commit migration 5**

```bash
git add backend/migrations/000005_service_tracking.up.sql backend/migrations/000005_service_tracking.down.sql
git commit -m "feat(db): add migration 000005 - statements, service lines, photos"
```

---

## Task 6: Migration 000006 - Indexes

**Files:**
- Create: `backend/migrations/000006_indexes.up.sql`
- Create: `backend/migrations/000006_indexes.down.sql`

- [ ] **Step 1: Create indexes up migration**

Create file `backend/migrations/000006_indexes.up.sql`:

```sql
-- 000006_indexes.up.sql
-- Performance indexes for common query patterns

-- Contacts
CREATE INDEX idx_contacts_chatwoot_id ON contacts(chatwoot_contact_id) WHERE chatwoot_contact_id IS NOT NULL;
CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_role ON contacts(role);

-- Users
CREATE INDEX idx_users_contact_id ON users(contact_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active) WHERE active = true;

-- Properties
CREATE INDEX idx_properties_active ON properties(active) WHERE active = true;
CREATE INDEX idx_properties_tier ON properties(tier);

-- Property Owners
CREATE INDEX idx_property_owners_property ON property_owners(property_id);
CREATE INDEX idx_property_owners_contact ON property_owners(contact_id);

-- Service Agreements
CREATE INDEX idx_service_agreements_property ON service_agreements(property_id);
CREATE INDEX idx_service_agreements_status ON service_agreements(status);

-- Bookings
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_external_uid ON bookings(external_uid) WHERE external_uid IS NOT NULL;
CREATE INDEX idx_bookings_statement_id ON bookings(statement_id) WHERE statement_id IS NOT NULL;
CREATE INDEX idx_bookings_cleaning_job_id ON bookings(cleaning_job_id) WHERE cleaning_job_id IS NOT NULL;

-- Cleaning Jobs
CREATE INDEX idx_cleaning_jobs_property_id ON cleaning_jobs(property_id);
CREATE INDEX idx_cleaning_jobs_scheduled_date ON cleaning_jobs(scheduled_date);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);
CREATE INDEX idx_cleaning_jobs_booking_id ON cleaning_jobs(booking_id) WHERE booking_id IS NOT NULL;

-- Cleaning Job Staff
CREATE INDEX idx_cleaning_job_staff_job ON cleaning_job_staff(job_id);
CREATE INDEX idx_cleaning_job_staff_contact ON cleaning_job_staff(contact_id);

-- Service Lines
CREATE INDEX idx_service_lines_property_id ON service_lines(property_id);
CREATE INDEX idx_service_lines_booking_id ON service_lines(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_service_lines_statement_id ON service_lines(statement_id) WHERE statement_id IS NOT NULL;
CREATE INDEX idx_service_lines_date ON service_lines(date);
CREATE INDEX idx_service_lines_type ON service_lines(type);

-- Owner Statements
CREATE INDEX idx_owner_statements_property_id ON owner_statements(property_id);
CREATE INDEX idx_owner_statements_property_owner ON owner_statements(property_owner_id);
CREATE INDEX idx_owner_statements_period ON owner_statements(period_start, period_end);
CREATE INDEX idx_owner_statements_status ON owner_statements(status);

-- Photos
CREATE INDEX idx_photos_job_id ON photos(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_photos_visibility ON photos(visibility);
```

- [ ] **Step 2: Create indexes down migration**

Create file `backend/migrations/000006_indexes.down.sql`:

```sql
-- 000006_indexes.down.sql

-- Photos
DROP INDEX IF EXISTS idx_photos_visibility;
DROP INDEX IF EXISTS idx_photos_uploaded_by;
DROP INDEX IF EXISTS idx_photos_job_id;

-- Owner Statements
DROP INDEX IF EXISTS idx_owner_statements_status;
DROP INDEX IF EXISTS idx_owner_statements_period;
DROP INDEX IF EXISTS idx_owner_statements_property_owner;
DROP INDEX IF EXISTS idx_owner_statements_property_id;

-- Service Lines
DROP INDEX IF EXISTS idx_service_lines_type;
DROP INDEX IF EXISTS idx_service_lines_date;
DROP INDEX IF EXISTS idx_service_lines_statement_id;
DROP INDEX IF EXISTS idx_service_lines_booking_id;
DROP INDEX IF EXISTS idx_service_lines_property_id;

-- Cleaning Job Staff
DROP INDEX IF EXISTS idx_cleaning_job_staff_contact;
DROP INDEX IF EXISTS idx_cleaning_job_staff_job;

-- Cleaning Jobs
DROP INDEX IF EXISTS idx_cleaning_jobs_booking_id;
DROP INDEX IF EXISTS idx_cleaning_jobs_status;
DROP INDEX IF EXISTS idx_cleaning_jobs_scheduled_date;
DROP INDEX IF EXISTS idx_cleaning_jobs_property_id;

-- Bookings
DROP INDEX IF EXISTS idx_bookings_cleaning_job_id;
DROP INDEX IF EXISTS idx_bookings_statement_id;
DROP INDEX IF EXISTS idx_bookings_external_uid;
DROP INDEX IF EXISTS idx_bookings_check_out;
DROP INDEX IF EXISTS idx_bookings_check_in;
DROP INDEX IF EXISTS idx_bookings_property_id;

-- Service Agreements
DROP INDEX IF EXISTS idx_service_agreements_status;
DROP INDEX IF EXISTS idx_service_agreements_property;

-- Property Owners
DROP INDEX IF EXISTS idx_property_owners_contact;
DROP INDEX IF EXISTS idx_property_owners_property;

-- Properties
DROP INDEX IF EXISTS idx_properties_tier;
DROP INDEX IF EXISTS idx_properties_active;

-- Users
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_contact_id;

-- Contacts
DROP INDEX IF EXISTS idx_contacts_role;
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_chatwoot_id;
```

- [ ] **Step 3: Commit migration 6**

```bash
git add backend/migrations/000006_indexes.up.sql backend/migrations/000006_indexes.down.sql
git commit -m "feat(db): add migration 000006 - performance indexes"
```

---

## Task 7: Run Migrations

**Files:**
- None (database operation)

- [ ] **Step 1: Remove placeholder .keep file**

```bash
rm -f backend/migrations/.keep
```

- [ ] **Step 2: Install golang-migrate CLI**

```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

- [ ] **Step 3: Run all migrations**

```bash
cd backend && migrate -path migrations -database "postgresql://postgres:xFcXKBDlOTMxcXfstNYpYVTCRMfqqkyG@postgres.railway.internal:5432/railway?sslmode=disable" up
```

Expected output:
```
1/u enums (XXms)
2/u core (XXms)
3/u properties (XXms)
4/u bookings (XXms)
5/u service_tracking (XXms)
6/u indexes (XXms)
```

- [ ] **Step 4: Verify migration version**

```bash
migrate -path migrations -database "postgresql://postgres:xFcXKBDlOTMxcXfstNYpYVTCRMfqqkyG@postgres.railway.internal:5432/railway?sslmode=disable" version
```

Expected output: `6`

- [ ] **Step 5: Commit removal of .keep file**

```bash
git add -A && git commit -m "chore(db): remove migrations placeholder after running migrations"
```

---

## Task 8: Update Domain Entities

**Files:**
- Modify: `backend/internal/domain/entities.go`

- [ ] **Step 1: Read current entities file**

Read `backend/internal/domain/entities.go` to understand current structure.

- [ ] **Step 2: Update entities to match schema**

Replace contents of `backend/internal/domain/entities.go`:

```go
package domain

import (
	"time"

	"github.com/google/uuid"
)

// Enum types matching PostgreSQL enums

type UserRole string

const (
	RoleAdmin            UserRole = "admin"
	RoleCleaner          UserRole = "cleaner"
	RoleCleaningClient   UserRole = "cleaning_client"
	RolePMOwner          UserRole = "pm_owner"
	RoleRenovationClient UserRole = "renovation_client"
	RoleSubtrade         UserRole = "subtrade"
	RoleBookkeeper       UserRole = "bookkeeper"
)

type ServiceTier string

const (
	Tier1 ServiceTier = "1"
	Tier2 ServiceTier = "2"
	Tier3 ServiceTier = "3"
)

type BookingSource string

const (
	SourceAirbnb   BookingSource = "airbnb"
	SourceVRBO     BookingSource = "vrbo"
	SourceDirect   BookingSource = "direct"
	SourceOwnerUse BookingSource = "owner_use"
	SourcePlatform BookingSource = "platform"
)

type TaxTreatment string

const (
	TaxAirbnbManaged TaxTreatment = "airbnb_managed"
	TaxDirect        TaxTreatment = "direct"
	TaxNone          TaxTreatment = "none"
)

type ServiceLineType string

const (
	ServiceCleaning    ServiceLineType = "cleaning"
	ServiceLaundry     ServiceLineType = "laundry"
	ServiceShoveling   ServiceLineType = "shoveling"
	ServiceMaintenance ServiceLineType = "maintenance"
	ServicePurchase    ServiceLineType = "purchase"
	ServiceRestock     ServiceLineType = "restock"
)

type TaxType string

const (
	TaxTypeGSTOnly    TaxType = "gst_only"
	TaxTypeGSTPST     TaxType = "gst_pst"
	TaxTypeGSTPSTMRDT TaxType = "gst_pst_mrdt"
	TaxTypeNone       TaxType = "none"
)

type StatementStatus string

const (
	StatementDraft StatementStatus = "draft"
	StatementSent  StatementStatus = "sent"
	StatementPaid  StatementStatus = "paid"
)

type JobStatus string

const (
	JobAssigned   JobStatus = "assigned"
	JobInProgress JobStatus = "in_progress"
	JobComplete   JobStatus = "complete"
	JobFlagged    JobStatus = "flagged"
)

type CompModel string

const (
	CompHourly CompModel = "hourly"
	CompPerJob CompModel = "per_job"
)

type PhotoVisibility string

const (
	PhotoInternal PhotoVisibility = "internal"
	PhotoOwner    PhotoVisibility = "owner"
	PhotoPublic   PhotoVisibility = "public"
)

type AgreementType string

const (
	AgreementCleaning          AgreementType = "cleaning"
	AgreementPM                AgreementType = "pm"
	AgreementRenovationFixed   AgreementType = "renovation_fixed"
	AgreementRenovationCostPlus AgreementType = "renovation_cost_plus"
	AgreementRenovationTAndM   AgreementType = "renovation_t_and_m"
)

// Core entities

type Contact struct {
	ID                uuid.UUID  `json:"id"`
	FirstName         string     `json:"first_name"`
	LastName          string     `json:"last_name"`
	Email             *string    `json:"email,omitempty"`
	Phone             *string    `json:"phone,omitempty"`
	CompanyName       *string    `json:"company_name,omitempty"`
	Role              UserRole   `json:"role"`
	Notes             *string    `json:"notes,omitempty"`
	ChatwootContactID *int64     `json:"chatwoot_contact_id,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type User struct {
	ID                   uuid.UUID  `json:"id"`
	ContactID            uuid.UUID  `json:"contact_id"`
	Email                string     `json:"email"`
	PasswordHash         string     `json:"-"`
	Role                 UserRole   `json:"role"`
	RefreshTokenHash     *string    `json:"-"`
	RefreshTokenExpiresAt *time.Time `json:"-"`
	LastLoginAt          *time.Time `json:"last_login_at,omitempty"`
	Active               bool       `json:"active"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

// Property Management entities

type ChecklistTemplate struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Rooms     []byte    `json:"rooms"` // JSONB stored as bytes
	Version   int       `json:"version"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Property struct {
	ID                       uuid.UUID    `json:"id"`
	Name                     string       `json:"name"`
	Address                  string       `json:"address"`
	Tier                     ServiceTier  `json:"tier"`
	CommissionRate           float64      `json:"commission_rate"`
	CleaningFee              float64      `json:"cleaning_fee"`
	CleaningFeeCommissionable bool        `json:"cleaning_fee_commissionable"`
	AirbnbIcalURL            *string      `json:"airbnb_ical_url,omitempty"`
	VRBOIcalURL              *string      `json:"vrbo_ical_url,omitempty"`
	WifiPassword             *string      `json:"wifi_password,omitempty"`
	AccessCodes              []byte       `json:"access_codes,omitempty"` // JSONB
	HotTub                   bool         `json:"hot_tub"`
	HotTubTempF              *int         `json:"hot_tub_temp_f,omitempty"`
	Notes                    *string      `json:"notes,omitempty"`
	SupplyList               []byte       `json:"supply_list,omitempty"` // JSONB
	ChecklistTemplateID      *uuid.UUID   `json:"checklist_template_id,omitempty"`
	Active                   bool         `json:"active"`
	CreatedAt                time.Time    `json:"created_at"`
	UpdatedAt                time.Time    `json:"updated_at"`
}

type PropertyOwner struct {
	ID             uuid.UUID `json:"id"`
	PropertyID     uuid.UUID `json:"property_id"`
	ContactID      uuid.UUID `json:"contact_id"`
	EquityShare    float64   `json:"equity_share"`
	PortalAccess   bool      `json:"portal_access"`
	StatementEmail *string   `json:"statement_email,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ServiceAgreement struct {
	ID             uuid.UUID     `json:"id"`
	PropertyID     uuid.UUID     `json:"property_id"`
	ContactID      uuid.UUID     `json:"contact_id"`
	Tier           ServiceTier   `json:"tier"`
	Type           AgreementType `json:"type"`
	MonthlyRate    *float64      `json:"monthly_rate,omitempty"`
	CommissionRate *float64      `json:"commission_rate,omitempty"`
	EffectiveDate  time.Time     `json:"effective_date"`
	ExpiryDate     *time.Time    `json:"expiry_date,omitempty"`
	DropboxSignID  *string       `json:"dropbox_sign_id,omitempty"`
	SignedAt       *time.Time    `json:"signed_at,omitempty"`
	DocumentKey    *string       `json:"document_key,omitempty"`
	Status         string        `json:"status"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
}

// Booking entities

type CleaningJob struct {
	ID                 uuid.UUID  `json:"id"`
	PropertyID         uuid.UUID  `json:"property_id"`
	BookingID          *uuid.UUID `json:"booking_id,omitempty"`
	ScheduledDate      time.Time  `json:"scheduled_date"`
	ScheduledTime      *string    `json:"scheduled_time,omitempty"`
	Status             JobStatus  `json:"status"`
	CompModel          CompModel  `json:"comp_model"`
	JobRate            *float64   `json:"job_rate,omitempty"`
	DurationHours      *float64   `json:"duration_hours,omitempty"`
	ArrivedAt          *time.Time `json:"arrived_at,omitempty"`
	CompletedAt        *time.Time `json:"completed_at,omitempty"`
	ChecklistData      []byte     `json:"checklist_data,omitempty"` // JSONB
	HotTubPhotoRequired bool      `json:"hot_tub_photo_required"`
	HotTubStatus       *string    `json:"hot_tub_status,omitempty"`
	DamageNotes        *string    `json:"damage_notes,omitempty"`
	RestockNotes       *string    `json:"restock_notes,omitempty"`
	InternalNotes      *string    `json:"internal_notes,omitempty"`
	DispatchedAt       *time.Time `json:"dispatched_at,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type Booking struct {
	ID                    uuid.UUID     `json:"id"`
	PropertyID            uuid.UUID     `json:"property_id"`
	Source                BookingSource `json:"source"`
	TaxTreatment          TaxTreatment  `json:"tax_treatment"`
	ExternalUID           *string       `json:"external_uid,omitempty"`
	GuestName             *string       `json:"guest_name,omitempty"`
	GuestEmail            *string       `json:"guest_email,omitempty"`
	GuestPhone            *string       `json:"guest_phone,omitempty"`
	CheckIn               time.Time     `json:"check_in"`
	CheckOut              time.Time     `json:"check_out"`
	Nights                int           `json:"nights"` // Generated column
	NightlyRate           *float64      `json:"nightly_rate,omitempty"`
	NightlyRateWeekend    *float64      `json:"nightly_rate_weekend,omitempty"`
	NightlyRateHoliday    *float64      `json:"nightly_rate_holiday,omitempty"`
	RevenueInclCleaningFee *float64     `json:"revenue_incl_cleaning_fee,omitempty"`
	RevenueExclCleaningFee *float64     `json:"revenue_excl_cleaning_fee,omitempty"`
	CleaningFeeCharged    *float64      `json:"cleaning_fee_charged,omitempty"`
	GST                   float64       `json:"gst"`
	PST                   float64       `json:"pst"`
	MRDT                  float64       `json:"mrdt"`
	Notes                 *string       `json:"notes,omitempty"`
	CleaningJobID         *uuid.UUID    `json:"cleaning_job_id,omitempty"`
	StatementID           *uuid.UUID    `json:"statement_id,omitempty"`
	ChatwootConversationID *int64       `json:"chatwoot_conversation_id,omitempty"`
	CreatedAt             time.Time     `json:"created_at"`
	UpdatedAt             time.Time     `json:"updated_at"`
}

type CleaningJobStaff struct {
	ID         uuid.UUID `json:"id"`
	JobID      uuid.UUID `json:"job_id"`
	ContactID  uuid.UUID `json:"contact_id"`
	HoursLogged *float64 `json:"hours_logged,omitempty"`
	HourlyRate *float64  `json:"hourly_rate,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Service Tracking entities

type OwnerStatement struct {
	ID                  uuid.UUID       `json:"id"`
	PropertyID          uuid.UUID       `json:"property_id"`
	PropertyOwnerID     uuid.UUID       `json:"property_owner_id"`
	PeriodStart         time.Time       `json:"period_start"`
	PeriodEnd           time.Time       `json:"period_end"`
	TotalRevenueInclFee *float64        `json:"total_revenue_incl_fee,omitempty"`
	TotalRevenueExclFee *float64        `json:"total_revenue_excl_fee,omitempty"`
	CommissionRate      *float64        `json:"commission_rate,omitempty"`
	CommissionTotal     *float64        `json:"commission_total,omitempty"`
	GSTCollected        *float64        `json:"gst_collected,omitempty"`
	PSTCollected        *float64        `json:"pst_collected,omitempty"`
	MRDTCollected       *float64        `json:"mrdt_collected,omitempty"`
	ExpensesCleaning    *float64        `json:"expenses_cleaning,omitempty"`
	ExpensesLaundry     *float64        `json:"expenses_laundry,omitempty"`
	ExpensesShoveling   *float64        `json:"expenses_shoveling,omitempty"`
	ExpensesMaintenance *float64        `json:"expenses_maintenance,omitempty"`
	ExpensesPurchases   *float64        `json:"expenses_purchases,omitempty"`
	ExpensesTotal       *float64        `json:"expenses_total,omitempty"`
	OwnerPayoutNet      *float64        `json:"owner_payout_net,omitempty"`
	Status              StatementStatus `json:"status"`
	PDFKey              *string         `json:"pdf_key,omitempty"`
	SentAt              *time.Time      `json:"sent_at,omitempty"`
	QBOInvoiceID        *string         `json:"qbo_invoice_id,omitempty"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

type ServiceLine struct {
	ID          uuid.UUID       `json:"id"`
	PropertyID  uuid.UUID       `json:"property_id"`
	BookingID   *uuid.UUID      `json:"booking_id,omitempty"`
	StatementID *uuid.UUID      `json:"statement_id,omitempty"`
	Type        ServiceLineType `json:"type"`
	Date        time.Time       `json:"date"`
	Description *string         `json:"description,omitempty"`
	Quantity    float64         `json:"quantity"`
	Rate        float64         `json:"rate"`
	MarkupRate  float64         `json:"markup_rate"`
	Subtotal    float64         `json:"subtotal"` // Generated
	TaxType     TaxType         `json:"tax_type"`
	GST         float64         `json:"gst"`   // Generated
	PST         float64         `json:"pst"`   // Generated
	Total       float64         `json:"total"` // Generated
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type Photo struct {
	ID          uuid.UUID       `json:"id"`
	JobID       *uuid.UUID      `json:"job_id,omitempty"`
	ProjectID   *uuid.UUID      `json:"project_id,omitempty"`
	UploadedBy  uuid.UUID       `json:"uploaded_by"`
	Bucket      string          `json:"bucket"`
	StorageKey  string          `json:"storage_key"`
	ContentType string          `json:"content_type"`
	SizeBytes   *int64          `json:"size_bytes,omitempty"`
	Visibility  PhotoVisibility `json:"visibility"`
	Room        *string         `json:"room,omitempty"`
	Caption     *string         `json:"caption,omitempty"`
	TakenAt     *time.Time      `json:"taken_at,omitempty"`
	IsRequired  bool            `json:"is_required"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
```

- [ ] **Step 3: Verify Go builds**

```bash
cd backend && go build ./...
```

Expected: No errors

- [ ] **Step 4: Commit updated entities**

```bash
git add backend/internal/domain/entities.go
git commit -m "feat(backend): update domain entities to match database schema"
```

---

## Task 9: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: List all migration files**

```bash
ls -la backend/migrations/
```

Expected: 12 files (6 up + 6 down) plus no .keep file

- [ ] **Step 2: Verify Go build passes**

```bash
cd backend && go build ./... && echo "Build OK"
```

Expected: `Build OK`

- [ ] **Step 3: Check git log**

```bash
git log --oneline -10
```

Expected: Clean commit history with migration commits

- [ ] **Step 4: Push to remote**

```bash
git push origin main
```

Expected: Success
