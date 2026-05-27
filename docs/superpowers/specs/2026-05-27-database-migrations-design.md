# Database Migrations Design (Core + PM Domain)

**Date:** 2026-05-27
**Status:** Approved
**Author:** Claude + Max (UbiShip)

## Overview

Create PostgreSQL migrations for the Core and Property Management domains using golang-migrate. This establishes the foundational schema required for P0-P2 functionality: user authentication, property management, booking sync, cleaning job dispatch, and owner statements.

## Decisions

| Decision | Choice |
|----------|--------|
| Migration tool | golang-migrate (already in project) |
| Migration structure | Logical groupings (6 migrations) |
| Scope | Core + PM domain tables only |
| Naming convention | `000001_name.up.sql` / `000001_name.down.sql` |
| Timestamps | `created_at`/`updated_at` via shared trigger |

## Migration Files

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
└── 000006_indexes.down.sql
```

## Migration 1: Enums

**File:** `000001_enums.up.sql`

Creates all enum types needed by the Core + PM domain:

```sql
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

**Down migration:** `DROP TYPE` for each enum in reverse order.

## Migration 2: Core

**File:** `000002_core.up.sql`

**Tables:** `contacts`, `users`

Creates the shared trigger function for `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### contacts

All people in the system. Staff, owners, clients, subtrades.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| first_name | text | NOT NULL |
| last_name | text | NOT NULL |
| email | text | UNIQUE |
| phone | text | |
| company_name | text | |
| role | user_role | NOT NULL |
| notes | text | |
| chatwoot_contact_id | bigint | UNIQUE |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### users

Authentication accounts. All provisioned by admin, no self-signup.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| contact_id | uuid | FK contacts, NOT NULL |
| email | text | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL |
| role | user_role | NOT NULL |
| refresh_token_hash | text | |
| refresh_token_expires_at | timestamptz | |
| last_login_at | timestamptz | |
| active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

## Migration 3: Properties

**File:** `000003_properties.up.sql`

**Tables:** `checklist_templates`, `properties`, `property_owners`, `service_agreements`

### checklist_templates

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| name | text | NOT NULL |
| rooms | jsonb | NOT NULL |
| version | int | DEFAULT 1 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### properties

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| name | text | NOT NULL |
| address | text | NOT NULL |
| tier | service_tier | NOT NULL |
| commission_rate | numeric(5,4) | DEFAULT 0.20 |
| cleaning_fee | numeric(10,2) | DEFAULT 300.00 |
| cleaning_fee_commissionable | boolean | DEFAULT false |
| airbnb_ical_url | text | |
| vrbo_ical_url | text | |
| wifi_password | text | |
| access_codes | jsonb | |
| hot_tub | boolean | DEFAULT false |
| hot_tub_temp_f | int | DEFAULT 104 |
| notes | text | |
| supply_list | jsonb | |
| checklist_template_id | uuid | FK checklist_templates |
| active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### property_owners

Junction table supporting co-ownership.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| contact_id | uuid | FK contacts, NOT NULL |
| equity_share | numeric(5,4) | DEFAULT 1.0 |
| portal_access | boolean | DEFAULT false |
| statement_email | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

UNIQUE constraint on (property_id, contact_id).

### service_agreements

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| contact_id | uuid | FK contacts, NOT NULL |
| tier | service_tier | NOT NULL |
| type | agreement_type | NOT NULL |
| monthly_rate | numeric(10,2) | |
| commission_rate | numeric(5,4) | |
| effective_date | date | NOT NULL |
| expiry_date | date | |
| dropbox_sign_id | text | |
| signed_at | timestamptz | |
| document_key | text | |
| status | text | DEFAULT 'pending' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

## Migration 4: Bookings

**File:** `000004_bookings.up.sql`

**Tables:** `cleaning_jobs`, `bookings`, `cleaning_job_staff`

Note: `cleaning_jobs` created before `bookings` because bookings references cleaning_job_id.

### cleaning_jobs

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| booking_id | uuid | FK bookings (added later via ALTER) |
| scheduled_date | date | NOT NULL |
| scheduled_time | time | |
| status | job_status | DEFAULT 'assigned' |
| comp_model | comp_model | DEFAULT 'hourly' |
| job_rate | numeric(10,2) | |
| duration_hours | numeric(5,2) | |
| arrived_at | timestamptz | |
| completed_at | timestamptz | |
| checklist_data | jsonb | |
| hot_tub_photo_required | boolean | DEFAULT false |
| hot_tub_status | text | |
| damage_notes | text | |
| restock_notes | text | |
| internal_notes | text | |
| dispatched_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### bookings

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| source | booking_source | NOT NULL |
| tax_treatment | tax_treatment | NOT NULL |
| external_uid | text | UNIQUE |
| guest_name | text | |
| guest_email | text | |
| guest_phone | text | |
| check_in | date | NOT NULL |
| check_out | date | NOT NULL |
| nights | int | GENERATED ALWAYS AS (check_out - check_in) STORED |
| nightly_rate | numeric(10,2) | |
| nightly_rate_weekend | numeric(10,2) | |
| nightly_rate_holiday | numeric(10,2) | |
| revenue_incl_cleaning_fee | numeric(10,2) | |
| revenue_excl_cleaning_fee | numeric(10,2) | |
| cleaning_fee_charged | numeric(10,2) | |
| gst | numeric(10,2) | DEFAULT 0 |
| pst | numeric(10,2) | DEFAULT 0 |
| mrdt | numeric(10,2) | DEFAULT 0 |
| notes | text | |
| cleaning_job_id | uuid | FK cleaning_jobs |
| statement_id | uuid | FK owner_statements (added in migration 5) |
| chatwoot_conversation_id | bigint | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

After both tables exist, add the back-reference:
```sql
ALTER TABLE cleaning_jobs ADD COLUMN booking_id uuid REFERENCES bookings(id);
```

### cleaning_job_staff

Junction: cleaners assigned to a job.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| job_id | uuid | FK cleaning_jobs, NOT NULL |
| contact_id | uuid | FK contacts, NOT NULL |
| hours_logged | numeric(5,2) | |
| hourly_rate | numeric(10,2) | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

UNIQUE constraint on (job_id, contact_id).

## Migration 5: Service Tracking

**File:** `000005_service_tracking.up.sql`

**Tables:** `owner_statements`, `service_lines`, `photos`

### owner_statements

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| property_owner_id | uuid | FK property_owners, NOT NULL |
| period_start | date | NOT NULL |
| period_end | date | NOT NULL |
| total_revenue_incl_fee | numeric(10,2) | |
| total_revenue_excl_fee | numeric(10,2) | |
| commission_rate | numeric(5,4) | |
| commission_total | numeric(10,2) | |
| gst_collected | numeric(10,2) | |
| pst_collected | numeric(10,2) | |
| mrdt_collected | numeric(10,2) | |
| expenses_cleaning | numeric(10,2) | |
| expenses_laundry | numeric(10,2) | |
| expenses_shoveling | numeric(10,2) | |
| expenses_maintenance | numeric(10,2) | |
| expenses_purchases | numeric(10,2) | |
| expenses_total | numeric(10,2) | |
| owner_payout_net | numeric(10,2) | |
| status | statement_status | DEFAULT 'draft' |
| pdf_key | text | |
| sent_at | timestamptz | |
| qbo_invoice_id | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

After table exists, add FK from bookings:
```sql
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_statement
    FOREIGN KEY (statement_id) REFERENCES owner_statements(id);
```

### service_lines

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| property_id | uuid | FK properties, NOT NULL |
| booking_id | uuid | FK bookings |
| statement_id | uuid | FK owner_statements |
| type | service_line_type | NOT NULL |
| date | date | NOT NULL |
| description | text | |
| quantity | numeric(8,2) | NOT NULL |
| rate | numeric(10,2) | NOT NULL |
| markup_rate | numeric(5,4) | DEFAULT 0 |
| subtotal | numeric(10,2) | GENERATED |
| tax_type | tax_type | NOT NULL |
| gst | numeric(10,2) | GENERATED |
| pst | numeric(10,2) | GENERATED |
| total | numeric(10,2) | GENERATED |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

Generated columns use formulas from payout engine spec.

### photos

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| job_id | uuid | FK cleaning_jobs |
| project_id | uuid | (reserved for renovations domain) |
| uploaded_by | uuid | FK contacts, NOT NULL |
| bucket | text | NOT NULL |
| storage_key | text | NOT NULL |
| content_type | text | DEFAULT 'image/jpeg' |
| size_bytes | bigint | |
| visibility | photo_visibility | DEFAULT 'internal' |
| room | text | |
| caption | text | |
| taken_at | timestamptz | |
| is_required | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

## Migration 6: Indexes

**File:** `000006_indexes.up.sql`

All performance indexes for common query patterns:

```sql
-- Contacts
CREATE INDEX idx_contacts_chatwoot_id ON contacts(chatwoot_contact_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_role ON contacts(role);

-- Users
CREATE INDEX idx_users_contact_id ON users(contact_id);
CREATE INDEX idx_users_email ON users(email);

-- Properties
CREATE INDEX idx_properties_active ON properties(active) WHERE active = true;

-- Property Owners
CREATE INDEX idx_property_owners_property ON property_owners(property_id);
CREATE INDEX idx_property_owners_contact ON property_owners(contact_id);

-- Bookings
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_external_uid ON bookings(external_uid);
CREATE INDEX idx_bookings_statement_id ON bookings(statement_id);

-- Cleaning Jobs
CREATE INDEX idx_cleaning_jobs_property_id ON cleaning_jobs(property_id);
CREATE INDEX idx_cleaning_jobs_scheduled_date ON cleaning_jobs(scheduled_date);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);
CREATE INDEX idx_cleaning_jobs_booking_id ON cleaning_jobs(booking_id);

-- Cleaning Job Staff
CREATE INDEX idx_cleaning_job_staff_job ON cleaning_job_staff(job_id);
CREATE INDEX idx_cleaning_job_staff_contact ON cleaning_job_staff(contact_id);

-- Service Lines
CREATE INDEX idx_service_lines_property_id ON service_lines(property_id);
CREATE INDEX idx_service_lines_booking_id ON service_lines(booking_id);
CREATE INDEX idx_service_lines_statement_id ON service_lines(statement_id);

-- Owner Statements
CREATE INDEX idx_owner_statements_property_id ON owner_statements(property_id);
CREATE INDEX idx_owner_statements_period ON owner_statements(period_start, period_end);
CREATE INDEX idx_owner_statements_status ON owner_statements(status);

-- Photos
CREATE INDEX idx_photos_job_id ON photos(job_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
```

## Implementation Notes

### Running Migrations

```bash
# Install golang-migrate CLI (if not present)
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run all migrations
migrate -path backend/migrations -database "$DATABASE_URL" up

# Rollback one migration
migrate -path backend/migrations -database "$DATABASE_URL" down 1

# Check current version
migrate -path backend/migrations -database "$DATABASE_URL" version
```

### After Migrations

1. Update `backend/internal/domain/entities.go` to match schema exactly
2. Implement repository methods in `backend/internal/repository/`
3. Update service layer to use real DB queries

## Success Criteria

1. All 6 migrations run without errors
2. `migrate version` shows version 6
3. All tables exist with correct columns and constraints
4. All indexes created
5. `updated_at` triggers fire correctly on UPDATE
