# Strathcona Operations Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Strathcona Summit Solutions' operational model into the platform with property categories, seasonal pricing, service rates, cancellation fees, consumables, and linen tracking.

**Architecture:** Extend the existing Go backend with new database migrations, domain entities, repository methods, service logic, and HTTP handlers. The changes build on existing patterns (chi router, pgx, service layer) with no new dependencies.

**Tech Stack:** Go 1.22, PostgreSQL 15, chi router, pgx/v5

**Spec:** `docs/superpowers/specs/2026-10-07-strathcona-operations-integration-design.md`

## Global Constraints

- Go 1.22 minimum
- PostgreSQL 15 with golang-migrate migrations
- All monetary values use `NUMERIC(10,2)` / `float64`
- Season boundaries: Winter = Nov 1 - Apr 30, Summer = May 1 - Oct 31
- Assessment hourly rate: $55.00
- Cancellation fee brackets: 168h+ ($0), 48-168h ($55), 24-48h (50%), <24h (100%)
- Alpine Village winter access allowance: 15 minutes
- Duvet rotation threshold: 4 turnovers

## Review Focus

1. **Season boundary dates (Oct 31 / Nov 1):** `GetSeason(time.Date(2026, 10, 31, 23, 59, 0, 0, time.UTC))` should return "summer", `GetSeason(time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC))` should return "winter"
2. **Cancellation fee boundary at exactly 168 hours:** Should return $0, not $55
3. **Condo properties should ignore seasonal rates:** Even if `turnover_rate_summer` is set, condo always uses `turnover_rate_annual`
4. **Assessment properties return $55/hr flat:** Regardless of category or season
5. **Winter access allowance only for alpine_village in winter:** Chalet properties in winter should NOT get the allowance

---

## File Structure

### Migrations (sequential)
- `backend/migrations/000016_add_property_category.up.sql` - Property category, assessment, seasonal rates
- `backend/migrations/000016_add_property_category.down.sql`
- `backend/migrations/000017_create_service_rates.up.sql` - Service rates table with seed data
- `backend/migrations/000017_create_service_rates.down.sql`
- `backend/migrations/000018_add_job_cancellation.up.sql` - Cancellation fields on cleaning_jobs
- `backend/migrations/000018_add_job_cancellation.down.sql`
- `backend/migrations/000019_create_consumables.up.sql` - Consumables catalog and property preferences
- `backend/migrations/000019_create_consumables.down.sql`
- `backend/migrations/000020_create_linens.up.sql` - Linen inventory and rotation tracking
- `backend/migrations/000020_create_linens.down.sql`

### Domain Layer
- `backend/internal/domain/entities.go` - Add new enums, extend Property struct, add new entity structs
- `backend/internal/domain/pricing.go` - Season and turnover rate logic (new file)

### Repository Layer
- `backend/internal/repository/repository.go` - Extend property queries for new columns
- `backend/internal/repository/service_rates.go` - Service rates CRUD (new file)
- `backend/internal/repository/consumables.go` - Consumables CRUD (new file)
- `backend/internal/repository/linens.go` - Linens CRUD (new file)

### Service Layer
- `backend/internal/service/service.go` - Extend with new repository dependencies
- `backend/internal/service/pricing.go` - Cancellation fee calculation (new file)
- `backend/internal/service/consumables.go` - Consumables business logic (new file)
- `backend/internal/service/linens.go` - Linen rotation logic (new file)

### Handler Layer
- `backend/internal/handler/properties.go` - Extend with category/assessment endpoints
- `backend/internal/handler/service_rates.go` - Service rates endpoints (new file)
- `backend/internal/handler/consumables.go` - Consumables endpoints (new file)
- `backend/internal/handler/linens.go` - Linens endpoints (new file)
- `backend/internal/handler/jobs.go` - Add cancel endpoint
- `backend/internal/handler/router.go` - Register new routes

### Tests
- `backend/internal/domain/pricing_test.go` - Unit tests for season/rate logic
- `backend/internal/service/pricing_test.go` - Cancellation fee tests
- `backend/internal/service/linens_test.go` - Linen rotation tests

---

## Task 1: Database Migration - Property Category & Pricing

**Files:**
- Create: `backend/migrations/000016_add_property_category.up.sql`
- Create: `backend/migrations/000016_add_property_category.down.sql`

**Interfaces:**
- Produces: `properties` table columns: `category`, `assessment_complete`, `assessment_turnover_count`, `turnover_rate_annual`, `turnover_rate_summer`, `turnover_rate_winter`, `winter_access_allowance_min`, `hot_tub_program_enrolled`, `hot_tub_last_drain_date`, `hot_tub_next_drain_date`

- [ ] **Step 1: Create up migration**

```sql
-- 000016_add_property_category.up.sql
ALTER TABLE properties ADD COLUMN category TEXT NOT NULL DEFAULT 'condo'
  CHECK (category IN ('condo', 'chalet', 'alpine_village'));

ALTER TABLE properties ADD COLUMN assessment_complete BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN assessment_turnover_count INT NOT NULL DEFAULT 0;

ALTER TABLE properties ADD COLUMN turnover_rate_annual NUMERIC(10,2);
ALTER TABLE properties ADD COLUMN turnover_rate_summer NUMERIC(10,2);
ALTER TABLE properties ADD COLUMN turnover_rate_winter NUMERIC(10,2);

ALTER TABLE properties ADD COLUMN winter_access_allowance_min INT NOT NULL DEFAULT 0;

ALTER TABLE properties ADD COLUMN hot_tub_program_enrolled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN hot_tub_last_drain_date DATE;
ALTER TABLE properties ADD COLUMN hot_tub_next_drain_date DATE;

-- Migrate existing data: set assessment_complete=true and copy cleaning_fee to turnover_rate_annual
UPDATE properties SET assessment_complete = true, turnover_rate_annual = cleaning_fee WHERE cleaning_fee > 0;
```

- [ ] **Step 2: Create down migration**

```sql
-- 000016_add_property_category.down.sql
ALTER TABLE properties DROP COLUMN hot_tub_next_drain_date;
ALTER TABLE properties DROP COLUMN hot_tub_last_drain_date;
ALTER TABLE properties DROP COLUMN hot_tub_program_enrolled;
ALTER TABLE properties DROP COLUMN winter_access_allowance_min;
ALTER TABLE properties DROP COLUMN turnover_rate_winter;
ALTER TABLE properties DROP COLUMN turnover_rate_summer;
ALTER TABLE properties DROP COLUMN turnover_rate_annual;
ALTER TABLE properties DROP COLUMN assessment_turnover_count;
ALTER TABLE properties DROP COLUMN assessment_complete;
ALTER TABLE properties DROP COLUMN category;
```

- [ ] **Step 3: Verify migration syntax**

Run: `cd backend && go run ./cmd/server` (will fail on connection but validates Go compiles)

- [ ] **Step 4: Commit**

```bash
git add backend/migrations/000016_add_property_category.up.sql backend/migrations/000016_add_property_category.down.sql
git commit -m "feat(db): add property category and seasonal pricing columns"
```

---

## Task 2: Database Migration - Service Rates

**Files:**
- Create: `backend/migrations/000017_create_service_rates.up.sql`
- Create: `backend/migrations/000017_create_service_rates.down.sql`

**Interfaces:**
- Produces: `service_rates` table with columns: `id`, `service_type`, `description`, `rate`, `rate_unit`, `min_charge`, `effective_date`, `expiry_date`, `created_at`, `updated_at`
- Produces: Extended `service_line_type` enum with new values

- [ ] **Step 1: Create up migration with seed data**

```sql
-- 000017_create_service_rates.up.sql
CREATE TABLE service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    rate_unit TEXT NOT NULL CHECK (rate_unit IN ('hour', 'flat', 'lb', 'turnover', 'month')),
    min_charge NUMERIC(10,2),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_service_rates_updated_at
    BEFORE UPDATE ON service_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO service_rates (service_type, description, rate, rate_unit, min_charge) VALUES
('cleaning_assessment', 'Initial/Assessment Cleaning', 55.00, 'hour', NULL),
('cleaning_deep', 'Custom Deep Clean', 65.00, 'hour', NULL),
('laundry_offsite', 'Off-site Laundry Service', 2.75, 'lb', 30.00),
('laundry_delivery_winter', 'Winter Laundry Delivery Surcharge', 25.00, 'flat', NULL),
('hot_tub_monthly', 'Hot Tub Care Program - Monthly', 150.00, 'month', NULL),
('hot_tub_turnover', 'Hot Tub Post-Guest Service', 40.00, 'turnover', NULL),
('hot_tub_drain_refill', 'Additional Drain & Refill', 199.00, 'flat', NULL),
('maintenance_callout', 'Maintenance Call-out (includes 1hr)', 75.00, 'flat', NULL),
('maintenance_hourly', 'Additional Maintenance Labor', 75.00, 'hour', NULL),
('maintenance_emergency', 'Emergency Maintenance', 150.00, 'hour', NULL),
('maintenance_overnight', 'Overnight Emergency (10pm-7am)', 225.00, 'hour', NULL),
('maintenance_parts_run', 'Off-mountain Parts Run', 75.00, 'hour', NULL),
('stockup_scheduled', 'Scheduled Stock-Up (4x/year)', 250.00, 'flat', NULL),
('stockup_unscheduled', 'Unscheduled Stock-Up Run', 75.00, 'hour', 112.50),
('stockup_emergency', 'Emergency Supply Run', 350.00, 'flat', NULL),
('winter_labor', 'Additional Winter Labor (beyond 15min)', 75.00, 'hour', NULL);

-- Extend service_line_type enum
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_monthly';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_turnover';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'hot_tub_drain';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'stockup';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'stockup_emergency';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'deep_clean';
ALTER TYPE service_line_type ADD VALUE IF NOT EXISTS 'winter_labor';
```

- [ ] **Step 2: Create down migration**

```sql
-- 000017_create_service_rates.down.sql
DROP TRIGGER IF EXISTS set_service_rates_updated_at ON service_rates;
DROP TABLE IF EXISTS service_rates;
-- Note: Cannot remove enum values in PostgreSQL, they remain but are unused
```

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/000017_create_service_rates.up.sql backend/migrations/000017_create_service_rates.down.sql
git commit -m "feat(db): create service_rates table with Strathcona rate card"
```

---

## Task 3: Database Migration - Job Cancellation

**Files:**
- Create: `backend/migrations/000018_add_job_cancellation.up.sql`
- Create: `backend/migrations/000018_add_job_cancellation.down.sql`

**Interfaces:**
- Produces: `cleaning_jobs` columns: `cancelled_at`, `cancellation_fee`, `cancellation_reason`
- Produces: `job_status` enum value `cancelled`

- [ ] **Step 1: Create up migration**

```sql
-- 000018_add_job_cancellation.up.sql
ALTER TABLE cleaning_jobs ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_fee NUMERIC(10,2);
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_reason TEXT;

ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'cancelled';
```

- [ ] **Step 2: Create down migration**

```sql
-- 000018_add_job_cancellation.down.sql
ALTER TABLE cleaning_jobs DROP COLUMN cancellation_reason;
ALTER TABLE cleaning_jobs DROP COLUMN cancellation_fee;
ALTER TABLE cleaning_jobs DROP COLUMN cancelled_at;
-- Note: Cannot remove enum values
```

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/000018_add_job_cancellation.up.sql backend/migrations/000018_add_job_cancellation.down.sql
git commit -m "feat(db): add cancellation fields to cleaning_jobs"
```

---

## Task 4: Database Migration - Consumables

**Files:**
- Create: `backend/migrations/000019_create_consumables.up.sql`
- Create: `backend/migrations/000019_create_consumables.down.sql`

**Interfaces:**
- Produces: `consumables` table with columns: `id`, `name`, `category`, `is_standard`, `unit`, `created_at`
- Produces: `property_consumables` table with columns: `id`, `property_id`, `consumable_id`, `enabled`, `par_level`, `notes`, `created_at`, `updated_at`
- Produces: `job_consumables` table with columns: `id`, `job_id`, `consumable_id`, `quantity_used`, `quantity_remaining`, `needs_restock`, `notes`, `created_at`

- [ ] **Step 1: Create up migration with seed data**

Write migration creating `consumables`, `property_consumables`, `job_consumables` tables. Seed with standard consumables (garbage bags, dish soap, toilet paper, hand soap, laundry detergent, dryer sheets, cleaners) and optional consumables (coffee, tea, toiletries, BBQ, fireplace, pet, seasonal items) per spec section 6.1.

- [ ] **Step 2: Create down migration**

Drop `job_consumables`, `property_consumables`, `consumables` tables in reverse order.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/000019_create_consumables.up.sql backend/migrations/000019_create_consumables.down.sql
git commit -m "feat(db): create consumables catalog and tracking tables"
```

---

## Task 5: Database Migration - Linens

**Files:**
- Create: `backend/migrations/000020_create_linens.up.sql`
- Create: `backend/migrations/000020_create_linens.down.sql`

**Interfaces:**
- Produces: `linen_type` enum: `sheet_set`, `duvet_cover`, `duvet_insert`, `mattress_pad`, `pillow`, `pillow_protector`, `body_towel`, `hand_towel`, `bath_mat`, `kitchen_towel`
- Produces: `bed_size` enum: `twin`, `double`, `queen`, `king`, `sofa_bed`
- Produces: `property_linens` table with columns: `id`, `property_id`, `linen_type`, `bed_size`, `location`, `quantity`, `required_sets`, `condition`, `last_deep_clean`, `turnovers_since_launder`, `notes`, `created_at`, `updated_at`
- Produces: `linen_rotation_log` table with columns: `id`, `property_linen_id`, `job_id`, `action`, `notes`, `created_at`

- [ ] **Step 1: Create up migration**

Write migration creating enums and tables per spec section 7.

- [ ] **Step 2: Create down migration**

Drop tables, then enums in reverse order.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/000020_create_linens.up.sql backend/migrations/000020_create_linens.down.sql
git commit -m "feat(db): create linen inventory and rotation tracking tables"
```

---

## Task 6: Domain Layer - Enums and Pricing Logic

**Files:**
- Modify: `backend/internal/domain/entities.go` (add enums, extend Property struct)
- Create: `backend/internal/domain/pricing.go` (season and rate functions)
- Create: `backend/internal/domain/pricing_test.go` (unit tests)

**Interfaces:**
- Produces: `PropertyCategory` type with constants `PropertyCategoryCondo`, `PropertyCategoryChalet`, `PropertyCategoryAlpineVillage`
- Produces: `LinenType` type with 10 constants per spec
- Produces: `BedSize` type with 5 constants per spec
- Produces: `func GetSeason(date time.Time) string` returning "winter" or "summer"
- Produces: `func (p *Property) GetTurnoverRate(date time.Time) (float64, error)`

- [ ] **Step 1: Write failing tests for GetSeason**

```go
// pricing_test.go
func TestGetSeason(t *testing.T) {
    tests := []struct {
        date     time.Time
        expected string
    }{
        {time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC), "winter"},
        {time.Date(2026, 4, 30, 23, 59, 0, 0, time.UTC), "winter"},
        {time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC), "summer"},
        {time.Date(2026, 7, 15, 0, 0, 0, 0, time.UTC), "summer"},
        {time.Date(2026, 10, 31, 23, 59, 0, 0, time.UTC), "summer"},
        {time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC), "winter"},
        {time.Date(2026, 12, 25, 0, 0, 0, 0, time.UTC), "winter"},
    }
    for _, tt := range tests {
        result := GetSeason(tt.date)
        if result != tt.expected {
            t.Errorf("GetSeason(%v) = %q, want %q", tt.date, result, tt.expected)
        }
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && go test ./internal/domain/... -v -run TestGetSeason`
Expected: FAIL (function not defined)

- [ ] **Step 3: Implement GetSeason in pricing.go**

Winter = November through April, Summer = May through October.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && go test ./internal/domain/... -v -run TestGetSeason`
Expected: PASS

- [ ] **Step 5: Write failing tests for GetTurnoverRate**

Test cases: condo with annual rate, condo in assessment, chalet summer, chalet winter, alpine_village winter, missing rate errors.

- [ ] **Step 6: Implement GetTurnoverRate on Property struct**

Per spec section 2.4 logic.

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd backend && go test ./internal/domain/... -v`
Expected: PASS

- [ ] **Step 8: Add new enums to entities.go**

Add `PropertyCategory`, `LinenType`, `BedSize`, `JobStatusCancelled` constant.

- [ ] **Step 9: Extend Property struct in entities.go**

Add fields: `Category`, `AssessmentComplete`, `AssessmentTurnoverCount`, `TurnoverRateAnnual`, `TurnoverRateSummer`, `TurnoverRateWinter`, `WinterAccessAllowanceMin`, `HotTubProgramEnrolled`, `HotTubLastDrainDate`, `HotTubNextDrainDate`.

- [ ] **Step 10: Add new entity structs**

Add `ServiceRate`, `Consumable`, `PropertyConsumable`, `JobConsumable`, `PropertyLinen`, `LinenRotationLog` structs per spec section 9.3.

- [ ] **Step 11: Commit**

```bash
git add backend/internal/domain/
git commit -m "feat(domain): add property categories, pricing logic, and new entities"
```

---

## Task 7: Repository Layer - Property Updates

**Files:**
- Modify: `backend/internal/repository/repository.go` (update property queries)

**Interfaces:**
- Consumes: Updated `Property` struct from Task 6
- Produces: Updated `CreateProperty`, `GetPropertyByID`, `ListProperties`, `UpdateProperty` with new columns
- Produces: `func (r *Repository) UpdatePropertyCategory(ctx, id, category) error`
- Produces: `func (r *Repository) CompletePropertyAssessment(ctx, id, rates) error`
- Produces: `func (r *Repository) IncrementAssessmentTurnover(ctx, id) error`

- [ ] **Step 1: Update property SELECT queries**

Add new columns to all property query SELECT lists.

- [ ] **Step 2: Update CreateProperty INSERT**

Add new columns with defaults.

- [ ] **Step 3: Update UpdateProperty**

Add new columns to UPDATE statement.

- [ ] **Step 4: Add UpdatePropertyCategory method**

Single-purpose update for category field only.

- [ ] **Step 5: Add CompletePropertyAssessment method**

Sets `assessment_complete = true` and populates rate fields based on category.

- [ ] **Step 6: Add IncrementAssessmentTurnover method**

`UPDATE properties SET assessment_turnover_count = assessment_turnover_count + 1 WHERE id = $1`

- [ ] **Step 7: Verify compilation**

Run: `cd backend && go build ./...`
Expected: Success

- [ ] **Step 8: Commit**

```bash
git add backend/internal/repository/repository.go
git commit -m "feat(repo): extend property repository with category and pricing fields"
```

---

## Task 8: Repository Layer - Service Rates

**Files:**
- Create: `backend/internal/repository/service_rates.go`

**Interfaces:**
- Produces: `func (r *Repository) ListServiceRates(ctx) ([]*domain.ServiceRate, error)`
- Produces: `func (r *Repository) GetServiceRate(ctx, serviceType string) (*domain.ServiceRate, error)`
- Produces: `func (r *Repository) UpdateServiceRate(ctx, rate *domain.ServiceRate) error`

- [ ] **Step 1: Implement ListServiceRates**

SELECT all from service_rates ordered by service_type.

- [ ] **Step 2: Implement GetServiceRate**

SELECT by service_type, return ErrNotFound if missing.

- [ ] **Step 3: Implement UpdateServiceRate**

UPDATE rate, min_charge, effective_date by service_type.

- [ ] **Step 4: Verify compilation**

Run: `cd backend && go build ./...`

- [ ] **Step 5: Commit**

```bash
git add backend/internal/repository/service_rates.go
git commit -m "feat(repo): add service rates repository"
```

---

## Task 9: Repository Layer - Consumables

**Files:**
- Create: `backend/internal/repository/consumables.go`

**Interfaces:**
- Produces: `func (r *Repository) ListConsumables(ctx) ([]*domain.Consumable, error)`
- Produces: `func (r *Repository) ListStandardConsumables(ctx) ([]*domain.Consumable, error)`
- Produces: `func (r *Repository) GetPropertyConsumables(ctx, propertyID) ([]*domain.PropertyConsumable, error)`
- Produces: `func (r *Repository) SetPropertyConsumable(ctx, pc *domain.PropertyConsumable) error`
- Produces: `func (r *Repository) CreateJobConsumables(ctx, jobID, consumables []domain.JobConsumable) error`
- Produces: `func (r *Repository) GetJobConsumables(ctx, jobID) ([]*domain.JobConsumable, error)`

- [ ] **Step 1: Implement consumables catalog queries**

List all, list where is_standard=true.

- [ ] **Step 2: Implement property consumables CRUD**

Get with JOIN to consumables, upsert on (property_id, consumable_id).

- [ ] **Step 3: Implement job consumables methods**

Batch insert, get by job_id.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/repository/consumables.go
git commit -m "feat(repo): add consumables repository"
```

---

## Task 10: Repository Layer - Linens

**Files:**
- Create: `backend/internal/repository/linens.go`

**Interfaces:**
- Produces: `func (r *Repository) GetPropertyLinens(ctx, propertyID) ([]*domain.PropertyLinen, error)`
- Produces: `func (r *Repository) CreatePropertyLinen(ctx, linen *domain.PropertyLinen) error`
- Produces: `func (r *Repository) UpdatePropertyLinen(ctx, linen *domain.PropertyLinen) error`
- Produces: `func (r *Repository) DeletePropertyLinen(ctx, id) error`
- Produces: `func (r *Repository) IncrementLinenTurnovers(ctx, propertyID) error`
- Produces: `func (r *Repository) ResetLinenTurnovers(ctx, linenID) error`
- Produces: `func (r *Repository) CreateLinenRotationLog(ctx, log *domain.LinenRotationLog) error`

- [ ] **Step 1: Implement property linens CRUD**

Standard CRUD operations on property_linens.

- [ ] **Step 2: Implement turnover tracking**

`IncrementLinenTurnovers`: UPDATE all duvet_insert linens for property, increment turnovers_since_launder.
`ResetLinenTurnovers`: Set turnovers_since_launder = 0 for specific linen.

- [ ] **Step 3: Implement rotation log**

Insert into linen_rotation_log.

- [ ] **Step 4: Commit**

```bash
git add backend/internal/repository/linens.go
git commit -m "feat(repo): add linens repository"
```

---

## Task 11: Service Layer - Pricing & Cancellation

**Files:**
- Create: `backend/internal/service/pricing.go`
- Create: `backend/internal/service/pricing_test.go`

**Interfaces:**
- Consumes: `Property.GetTurnoverRate(date)` from Task 6
- Produces: `func (s *Service) CalculateCancellationFee(ctx, jobID, cancelledAt) (float64, error)`
- Produces: `func (s *Service) CancelCleaningJob(ctx, jobID, reason) (*domain.CleaningJob, error)`

- [ ] **Step 1: Write failing tests for CalculateCancellationFee**

```go
func TestCalculateCancellationFee(t *testing.T) {
    tests := []struct {
        name          string
        hoursNotice   float64
        turnoverRate  float64
        expectedFee   float64
    }{
        {"7+ days", 168, 150.00, 0},
        {"exactly 168 hours", 168, 150.00, 0},
        {"167 hours", 167, 150.00, 55.00},
        {"48-168 hours", 72, 150.00, 55.00},
        {"exactly 48 hours", 48, 150.00, 55.00},
        {"47 hours", 47, 150.00, 75.00},  // 50% of 150
        {"24-48 hours", 36, 150.00, 75.00},
        {"exactly 24 hours", 24, 150.00, 75.00},
        {"23 hours", 23, 150.00, 150.00},  // 100%
        {"under 24 hours", 12, 200.00, 200.00},
    }
    // ... test implementation
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && go test ./internal/service/... -v -run TestCalculateCancellationFee`

- [ ] **Step 3: Implement CalculateCancellationFee**

Get job and property, call property.GetTurnoverRate, apply fee brackets from spec section 5.1.

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Implement CancelCleaningJob**

Calculate fee, update job with cancelled_at, cancellation_fee, cancellation_reason, status='cancelled'.

- [ ] **Step 6: Commit**

```bash
git add backend/internal/service/pricing.go backend/internal/service/pricing_test.go
git commit -m "feat(service): add cancellation fee calculation"
```

---

## Task 12: Service Layer - Linens

**Files:**
- Create: `backend/internal/service/linens.go`
- Create: `backend/internal/service/linens_test.go`

**Interfaces:**
- Consumes: Linen repository methods from Task 10
- Produces: `func (s *Service) CheckDuvetRotation(ctx, propertyID) ([]LinenAlert, error)`
- Produces: `func (s *Service) RecordLinenLaunder(ctx, linenID, jobID) error`
- Produces: `type LinenAlert struct { LinenID uuid.UUID; Location string; Message string }`

- [ ] **Step 1: Write failing test for CheckDuvetRotation**

```go
func TestCheckDuvetRotation(t *testing.T) {
    // Mock linen with turnovers_since_launder = 4 should generate alert
    // Mock linen with turnovers_since_launder = 3 should not generate alert
}
```

- [ ] **Step 2: Implement CheckDuvetRotation**

Get linens, filter duvet_insert where turnovers_since_launder >= 4, return alerts.

- [ ] **Step 3: Implement RecordLinenLaunder**

Reset turnovers, create rotation log entry with action='laundered'.

- [ ] **Step 4: Run tests**

Run: `cd backend && go test ./internal/service/... -v -run TestCheckDuvetRotation`

- [ ] **Step 5: Commit**

```bash
git add backend/internal/service/linens.go backend/internal/service/linens_test.go
git commit -m "feat(service): add linen rotation tracking"
```

---

## Task 13: Handler Layer - Property Extensions

**Files:**
- Modify: `backend/internal/handler/properties.go`
- Modify: `backend/internal/handler/router.go`

**Interfaces:**
- Consumes: Repository methods from Task 7
- Produces: `PUT /api/v1/properties/{id}/category` handler
- Produces: `PUT /api/v1/properties/{id}/assessment/complete` handler

- [ ] **Step 1: Add UpdatePropertyCategory handler**

Parse category from body, validate enum, call repo.UpdatePropertyCategory.

- [ ] **Step 2: Add CompleteAssessment handler**

Parse rates from body, validate based on category (condo needs annual, chalet/alpine need summer+winter), call repo.CompletePropertyAssessment.

- [ ] **Step 3: Register routes in router.go**

```go
r.Put("/api/v1/properties/{id}/category", h.UpdatePropertyCategory)
r.Put("/api/v1/properties/{id}/assessment/complete", h.CompleteAssessment)
```

- [ ] **Step 4: Commit**

```bash
git add backend/internal/handler/properties.go backend/internal/handler/router.go
git commit -m "feat(handler): add property category and assessment endpoints"
```

---

## Task 14: Handler Layer - Service Rates

**Files:**
- Create: `backend/internal/handler/service_rates.go`
- Modify: `backend/internal/handler/router.go`

**Interfaces:**
- Consumes: Repository methods from Task 8
- Produces: `GET /api/v1/service-rates` handler
- Produces: `GET /api/v1/service-rates/{service_type}` handler
- Produces: `PUT /api/v1/service-rates/{service_type}` handler (admin only)

- [ ] **Step 1: Implement ListServiceRates handler**

Return all rates as JSON array.

- [ ] **Step 2: Implement GetServiceRate handler**

Get by service_type path param.

- [ ] **Step 3: Implement UpdateServiceRate handler**

Admin-only (check role), update rate/min_charge/effective_date.

- [ ] **Step 4: Register routes**

- [ ] **Step 5: Commit**

```bash
git add backend/internal/handler/service_rates.go backend/internal/handler/router.go
git commit -m "feat(handler): add service rates endpoints"
```

---

## Task 15: Handler Layer - Consumables

**Files:**
- Create: `backend/internal/handler/consumables.go`
- Modify: `backend/internal/handler/router.go`

**Interfaces:**
- Consumes: Repository methods from Task 9
- Produces: `GET /api/v1/consumables` handler
- Produces: `GET /api/v1/consumables/standard` handler
- Produces: `GET /api/v1/properties/{id}/consumables` handler
- Produces: `POST /api/v1/properties/{id}/consumables` handler
- Produces: `PUT /api/v1/properties/{id}/consumables/{consumable_id}` handler

- [ ] **Step 1: Implement catalog handlers**

ListConsumables, ListStandardConsumables.

- [ ] **Step 2: Implement property consumables handlers**

Get, Create, Update property consumable preferences.

- [ ] **Step 3: Register routes**

- [ ] **Step 4: Commit**

```bash
git add backend/internal/handler/consumables.go backend/internal/handler/router.go
git commit -m "feat(handler): add consumables endpoints"
```

---

## Task 16: Handler Layer - Linens

**Files:**
- Create: `backend/internal/handler/linens.go`
- Modify: `backend/internal/handler/router.go`

**Interfaces:**
- Consumes: Repository methods from Task 10, Service methods from Task 12
- Produces: `GET /api/v1/properties/{id}/linens` handler
- Produces: `POST /api/v1/properties/{id}/linens` handler
- Produces: `PUT /api/v1/properties/{id}/linens/{linen_id}` handler
- Produces: `DELETE /api/v1/properties/{id}/linens/{linen_id}` handler
- Produces: `GET /api/v1/properties/{id}/linens/alerts` handler

- [ ] **Step 1: Implement CRUD handlers**

Standard CRUD for property linens.

- [ ] **Step 2: Implement alerts handler**

Call service.CheckDuvetRotation, return alerts.

- [ ] **Step 3: Register routes**

- [ ] **Step 4: Commit**

```bash
git add backend/internal/handler/linens.go backend/internal/handler/router.go
git commit -m "feat(handler): add linens endpoints"
```

---

## Task 17: Handler Layer - Job Cancellation

**Files:**
- Modify: `backend/internal/handler/jobs.go`
- Modify: `backend/internal/handler/router.go`

**Interfaces:**
- Consumes: Service methods from Task 11
- Produces: `POST /api/v1/jobs/{id}/cancel` handler

- [ ] **Step 1: Add CancelJob handler**

```go
type CancelJobRequest struct {
    Reason string `json:"reason"`
}

type CancelJobResponse struct {
    Job             *domain.CleaningJob `json:"job"`
    CancellationFee float64             `json:"cancellation_fee"`
}
```

Parse request, call service.CancelCleaningJob, return response with fee.

- [ ] **Step 2: Register route**

```go
r.Post("/api/v1/jobs/{id}/cancel", h.CancelJob)
```

- [ ] **Step 3: Commit**

```bash
git add backend/internal/handler/jobs.go backend/internal/handler/router.go
git commit -m "feat(handler): add job cancellation endpoint"
```

---

## Task 18: Integration - Service Constructor Updates

**Files:**
- Modify: `backend/internal/service/service.go`

**Interfaces:**
- Produces: Updated Service struct and constructor with all new capabilities

- [ ] **Step 1: Add LinenAlert type if not in domain**

- [ ] **Step 2: Verify all service methods are accessible**

Ensure pricing.go, linens.go methods are on Service struct or create wrapper methods.

- [ ] **Step 3: Verify compilation and tests pass**

Run: `cd backend && go build ./... && go test ./...`

- [ ] **Step 4: Commit**

```bash
git add backend/internal/service/service.go
git commit -m "feat(service): wire up all new service capabilities"
```

---

## Task 19: Final Integration Test

**Files:**
- All modified files

**Interfaces:**
- Validates: End-to-end flow works

- [ ] **Step 1: Run all tests**

Run: `cd backend && go test ./... -v`
Expected: All pass

- [ ] **Step 2: Run go vet**

Run: `cd backend && go vet ./...`
Expected: No issues

- [ ] **Step 3: Verify server starts**

Run: `cd backend && go build -o /tmp/server ./cmd/server`
Expected: Binary builds successfully

- [ ] **Step 4: Create summary commit**

```bash
git add -A
git commit -m "feat: complete Strathcona operations integration

Implements property categories (condo/chalet/alpine_village) with
seasonal pricing, assessment period tracking, service rates table,
job cancellation with fee calculation, consumables management,
and linen inventory with rotation tracking.

See docs/superpowers/specs/2026-10-07-strathcona-operations-integration-design.md"
```

---

## Summary

| Task | Component | Key Deliverable |
|------|-----------|-----------------|
| 1-5 | Migrations | Database schema for all new features |
| 6 | Domain | Enums, pricing logic with tests |
| 7-10 | Repository | Data access for all new entities |
| 11-12 | Service | Cancellation fees, linen rotation with tests |
| 13-17 | Handlers | API endpoints for all new features |
| 18-19 | Integration | Wiring and final verification |

Total: 19 tasks, each independently testable and committable.
