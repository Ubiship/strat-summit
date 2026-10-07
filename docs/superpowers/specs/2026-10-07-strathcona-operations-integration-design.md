# Strathcona Operations Integration Design

> **Created:** 2026-10-07
> **Status:** Draft
> **Source:** 11 PDF documents from Strathcona Summit Solutions operational handbook

---

## 1. Overview

### 1.1 Purpose

Integrate Strathcona Summit Solutions' complete operational model into the platform, including:
- Property categorization with seasonal pricing
- Assessment period tracking for new properties
- Multiple service types with specific rate structures
- Cancellation fee calculation
- Consumables management per property
- Linen inventory tracking
- Winter operations support

### 1.2 Success Criteria

- Properties can be categorized as Condo, Chalet, or Alpine Village
- Seasonal pricing (summer/winter) is supported for Chalet and Alpine Village properties
- New properties track assessment turnovers until flat rate is established
- All service types from Strathcona's rate card are billable
- Cancellation fees calculate correctly based on notice period
- Per-property consumables checklists are configurable
- Linen inventory tracks sets per bed with rotation scheduling
- Winter access allowance applies automatically to Alpine Village properties

### 1.3 Out of Scope

- Client-facing booking portal (separate project)
- Automated iCal sync implementation (exists as stub)
- PDF statement generation (Phase 2)
- QBO sync (Phase 2)

---

## 2. Property Categories & Seasonal Pricing

### 2.1 Property Category Enum

Three property categories determine pricing structure:

| Category | Location | Pricing Model |
|----------|----------|---------------|
| `condo` | Outside Alpine Village | Annual flat rate (one rate year-round) |
| `chalet` | Outside Alpine Village | Seasonal rates (summer + winter) |
| `alpine_village` | Within Alpine Village | Seasonal rates + winter access allowance |

**Alpine Village distinction:** Properties in Alpine Village have non-vehicle winter access, requiring additional labor for equipment transport via sled/backpack. This adds a 15-minute access prep allowance to winter turnovers.

### 2.2 Schema Changes - Properties Table

Add columns to `properties`:

```sql
ALTER TABLE properties ADD COLUMN category TEXT NOT NULL DEFAULT 'condo'
  CHECK (category IN ('condo', 'chalet', 'alpine_village'));

-- Assessment tracking
ALTER TABLE properties ADD COLUMN assessment_complete BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN assessment_turnover_count INT NOT NULL DEFAULT 0;

-- Turnover rates (flat rate after assessment)
ALTER TABLE properties ADD COLUMN turnover_rate_annual NUMERIC(10,2);  -- condo only
ALTER TABLE properties ADD COLUMN turnover_rate_summer NUMERIC(10,2);  -- chalet/alpine
ALTER TABLE properties ADD COLUMN turnover_rate_winter NUMERIC(10,2);  -- chalet/alpine

-- Winter operations
ALTER TABLE properties ADD COLUMN winter_access_allowance_min INT NOT NULL DEFAULT 0;
  -- 0 for condo/chalet, 15 for alpine_village
```

### 2.3 Season Determination

Seasons are determined by date:
- **Winter:** November 1 - April 30
- **Summer:** May 1 - October 31

Service layer function:

```go
func GetSeason(date time.Time) string {
    month := date.Month()
    if month >= time.November || month <= time.April {
        return "winter"
    }
    return "summer"
}
```

### 2.4 Turnover Rate Resolution

Logic to determine applicable turnover rate:

```go
func (p *Property) GetTurnoverRate(date time.Time) (float64, error) {
    if !p.AssessmentComplete {
        return 55.00, nil // Assessment hourly rate
    }

    switch p.Category {
    case "condo":
        if p.TurnoverRateAnnual == nil {
            return 0, errors.New("condo missing annual rate")
        }
        return *p.TurnoverRateAnnual, nil

    case "chalet", "alpine_village":
        season := GetSeason(date)
        if season == "winter" {
            if p.TurnoverRateWinter == nil {
                return 0, errors.New("property missing winter rate")
            }
            return *p.TurnoverRateWinter, nil
        }
        if p.TurnoverRateSummer == nil {
            return 0, errors.New("property missing summer rate")
        }
        return *p.TurnoverRateSummer, nil

    default:
        return 0, errors.New("unknown property category")
    }
}
```

---

## 3. Assessment Period

### 3.1 Business Rules

New properties start in assessment mode:
- Turnovers billed at **$55/hour** during assessment
- Assessment complete after **4 representative turnovers**
- Admin manually marks assessment complete and sets flat rate
- "Representative" means typical turnover (not deep clean, not unusual circumstances)

### 3.2 Workflow

1. Property created with `assessment_complete = false`
2. Each turnover job completed increments `assessment_turnover_count`
3. After 4+ turnovers, admin reviews actual hours and sets flat rate
4. Admin sets `assessment_complete = true` and populates rate fields
5. Future turnovers use flat rate

### 3.3 Admin UI Requirements

- Properties list shows assessment status badge
- Property detail shows turnover count progress (e.g., "2/4 assessment turnovers")
- "Complete Assessment" action allows setting flat rate(s)
- Historical job hours visible for rate determination

---

## 4. Service Types & Rates

### 4.1 Service Rate Configuration

New table to store configurable service rates:

```sql
CREATE TABLE service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL,
    description TEXT NOT NULL,
    rate NUMERIC(10,2) NOT NULL,
    rate_unit TEXT NOT NULL,  -- 'hour', 'flat', 'lb', 'turnover', 'month'
    min_charge NUMERIC(10,2),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with Strathcona rates
INSERT INTO service_rates (service_type, description, rate, rate_unit, min_charge) VALUES
-- Cleaning
('cleaning_assessment', 'Initial/Assessment Cleaning', 55.00, 'hour', NULL),
('cleaning_deep', 'Custom Deep Clean', 65.00, 'hour', NULL),
('cleaning_pre_arrival', 'Pre-Arrival Check', 0, 'flat', NULL),  -- included in turnover

-- Laundry
('laundry_offsite', 'Off-site Laundry Service', 2.75, 'lb', 30.00),
('laundry_delivery_winter', 'Winter Laundry Delivery Surcharge', 25.00, 'flat', NULL),

-- Hot Tub
('hot_tub_monthly', 'Hot Tub Care Program - Monthly', 150.00, 'month', NULL),
('hot_tub_turnover', 'Hot Tub Post-Guest Service', 40.00, 'turnover', NULL),
('hot_tub_drain_refill', 'Additional Drain & Refill', 199.00, 'flat', NULL),

-- Maintenance
('maintenance_callout', 'Maintenance Call-out (includes 1hr)', 75.00, 'flat', NULL),
('maintenance_hourly', 'Additional Maintenance Labor', 75.00, 'hour', NULL),
('maintenance_emergency', 'Emergency Maintenance', 150.00, 'hour', NULL),
('maintenance_overnight', 'Overnight Emergency (10pm-7am)', 225.00, 'hour', NULL),
('maintenance_parts_run', 'Off-mountain Parts Run', 75.00, 'hour', NULL),

-- Stock-Up
('stockup_scheduled', 'Scheduled Stock-Up (4x/year)', 250.00, 'flat', NULL),
('stockup_unscheduled', 'Unscheduled Stock-Up Run', 75.00, 'hour', 112.50),  -- 1.5hr min
('stockup_emergency', 'Emergency Supply Run', 350.00, 'flat', NULL),

-- Winter Labor
('winter_labor', 'Additional Winter Labor (beyond 15min)', 75.00, 'hour', NULL);
```

### 4.2 Extended Service Line Types

Update the `service_line_type` enum:

```sql
ALTER TYPE service_line_type ADD VALUE 'hot_tub_monthly';
ALTER TYPE service_line_type ADD VALUE 'hot_tub_turnover';
ALTER TYPE service_line_type ADD VALUE 'hot_tub_drain';
ALTER TYPE service_line_type ADD VALUE 'stockup';
ALTER TYPE service_line_type ADD VALUE 'stockup_emergency';
ALTER TYPE service_line_type ADD VALUE 'deep_clean';
ALTER TYPE service_line_type ADD VALUE 'winter_labor';
```

### 4.3 Hot Tub Program

Add to `properties`:

```sql
ALTER TABLE properties ADD COLUMN hot_tub_program_enrolled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE properties ADD COLUMN hot_tub_last_drain_date DATE;
ALTER TABLE properties ADD COLUMN hot_tub_next_drain_date DATE;
```

Hot tub program rules:
- Monthly fee: $150 (billed to owner statement)
- Per-turnover service: $40 (auto-added to cleaning job if enrolled)
- Seasonal drain/refill: 4x per year (included in monthly)
- Additional drain/refill: $199

---

## 5. Cancellation Fees

### 5.1 Fee Schedule

| Notice Period | Fee |
|---------------|-----|
| 7+ days | No fee |
| 48 hours - 7 days | $55 scheduling fee |
| 24-48 hours | 50% of turnover charge |
| Under 24 hours | 100% of turnover charge |

### 5.2 Implementation

Add to `cleaning_jobs`:

```sql
ALTER TABLE cleaning_jobs ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_fee NUMERIC(10,2);
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_reason TEXT;
```

Add job status:

```sql
ALTER TYPE job_status ADD VALUE 'cancelled';
```

Service layer calculation:

```go
func CalculateCancellationFee(job *CleaningJob, property *Property, cancelledAt time.Time) float64 {
    hoursNotice := job.ScheduledDate.Sub(cancelledAt).Hours()
    turnoverRate, _ := property.GetTurnoverRate(job.ScheduledDate)

    switch {
    case hoursNotice >= 168: // 7 days
        return 0
    case hoursNotice >= 48:
        return 55.00 // Scheduling fee
    case hoursNotice >= 24:
        return turnoverRate * 0.50
    default:
        return turnoverRate
    }
}
```

---

## 6. Consumables Management

### 6.1 Consumables Catalog

Master list of trackable consumables:

```sql
CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_standard BOOLEAN NOT NULL DEFAULT false,
    unit TEXT,  -- 'roll', 'bottle', 'box', 'bag', etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Standard consumables (always tracked)
INSERT INTO consumables (name, category, is_standard, unit) VALUES
('Garbage Bags (Large)', 'cleaning', true, 'bag'),
('Garbage Bags (Small)', 'cleaning', true, 'bag'),
('Dish Soap', 'kitchen', true, 'bottle'),
('Dishwasher Pods', 'kitchen', true, 'pod'),
('Toilet Paper', 'bathroom', true, 'roll'),
('Hand Soap', 'bathroom', true, 'bottle'),
('Laundry Detergent', 'laundry', true, 'load'),
('Dryer Sheets', 'laundry', true, 'sheet'),
('All-Purpose Cleaner', 'cleaning', true, 'bottle'),
('Glass Cleaner', 'cleaning', true, 'bottle'),
('Disinfectant Wipes', 'cleaning', true, 'container');

-- Optional consumables
INSERT INTO consumables (name, category, is_standard, unit) VALUES
('Coffee (Ground)', 'kitchen_amenity', false, 'bag'),
('Coffee Pods', 'kitchen_amenity', false, 'pod'),
('Tea Bags', 'kitchen_amenity', false, 'bag'),
('Sugar', 'kitchen_amenity', false, 'container'),
('Creamer', 'kitchen_amenity', false, 'container'),
('Salt & Pepper', 'kitchen_amenity', false, 'set'),
('Cooking Oil', 'kitchen_amenity', false, 'bottle'),
('Shampoo', 'bathroom_amenity', false, 'bottle'),
('Conditioner', 'bathroom_amenity', false, 'bottle'),
('Body Wash', 'bathroom_amenity', false, 'bottle'),
('Lotion', 'bathroom_amenity', false, 'bottle'),
('BBQ Propane', 'bbq', false, 'tank'),
('BBQ Brush', 'bbq', false, 'each'),
('Fire Starters', 'fireplace', false, 'box'),
('Firewood (bundle)', 'fireplace', false, 'bundle'),
('Pet Waste Bags', 'pet', false, 'roll'),
('Bug Spray', 'seasonal', false, 'can'),
('Sunscreen', 'seasonal', false, 'bottle'),
('Ice Melt', 'seasonal', false, 'bag');
```

### 6.2 Property Consumables Preferences

```sql
CREATE TABLE property_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    consumable_id UUID NOT NULL REFERENCES consumables(id),
    enabled BOOLEAN NOT NULL DEFAULT true,
    par_level INT,  -- target quantity to maintain
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(property_id, consumable_id)
);
```

### 6.3 Consumables Tracking on Jobs

```sql
CREATE TABLE job_consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES cleaning_jobs(id),
    consumable_id UUID NOT NULL REFERENCES consumables(id),
    quantity_used INT NOT NULL DEFAULT 0,
    quantity_remaining INT,
    needs_restock BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Linen Inventory

### 7.1 Linen Types

```sql
CREATE TYPE linen_type AS ENUM (
    'sheet_set',      -- fitted, flat, pillowcases
    'duvet_cover',
    'duvet_insert',
    'mattress_pad',
    'pillow',
    'pillow_protector',
    'body_towel',
    'hand_towel',
    'bath_mat',
    'kitchen_towel'
);

CREATE TYPE bed_size AS ENUM ('twin', 'double', 'queen', 'king', 'sofa_bed');
```

### 7.2 Property Linens Table

```sql
CREATE TABLE property_linens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id),
    linen_type linen_type NOT NULL,
    bed_size bed_size,  -- NULL for towels
    location TEXT,  -- 'Master Bedroom', 'Guest Room 1', 'Bathroom 1', etc.
    quantity INT NOT NULL DEFAULT 1,
    required_sets INT NOT NULL DEFAULT 3,  -- 3 sheet sets per bed per Strathcona policy
    condition TEXT DEFAULT 'good',  -- 'good', 'fair', 'needs_replacement'
    last_deep_clean DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.3 Linen Requirements (from Strathcona Policy)

| Item | Requirement |
|------|-------------|
| Sheet sets | 3 complete sets per sleeping surface |
| Duvet covers | 2 per bed + 1 spare per size |
| Body towels | 4 per queen/king, 1 per twin + backup sets |
| Hand towels | 2 per bathroom + backups |
| Bath mats | 1 per bathroom |
| Kitchen towels | 3 minimum |

### 7.4 Duvet Rotation Tracking

Duvets must be laundered every 4th turnover minimum:

```sql
CREATE TABLE linen_rotation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_linen_id UUID NOT NULL REFERENCES property_linens(id),
    job_id UUID REFERENCES cleaning_jobs(id),
    action TEXT NOT NULL,  -- 'laundered', 'rotated', 'replaced'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track turnovers since last duvet launder
ALTER TABLE property_linens ADD COLUMN turnovers_since_launder INT NOT NULL DEFAULT 0;
```

Service layer check:

```go
func (s *Service) CheckDuvetRotation(ctx context.Context, propertyID uuid.UUID) ([]LinenAlert, error) {
    linens, err := s.repo.GetPropertyLinens(ctx, propertyID)
    if err != nil {
        return nil, err
    }

    var alerts []LinenAlert
    for _, l := range linens {
        if l.LinenType == "duvet_insert" && l.TurnoversSinceLaunder >= 4 {
            alerts = append(alerts, LinenAlert{
                LinenID:  l.ID,
                Location: l.Location,
                Message:  fmt.Sprintf("Duvet needs laundering (%d turnovers)", l.TurnoversSinceLaunder),
            })
        }
    }
    return alerts, nil
}
```

---

## 8. Winter Operations

### 8.1 Winter Access Allowance

Alpine Village properties include 15-minute access prep allowance in winter rates. Additional winter labor beyond 15 minutes billed at $75/hour.

Logic in cleaning job completion:

```go
func (s *Service) CompleteCleaningJob(ctx context.Context, jobID uuid.UUID, completionData CompletionData) error {
    job, _ := s.repo.GetCleaningJob(ctx, jobID)
    property, _ := s.repo.GetProperty(ctx, job.PropertyID)

    // Check for winter labor surcharge
    if property.Category == "alpine_village" && GetSeason(job.ScheduledDate) == "winter" {
        if completionData.AccessPrepMinutes > 15 {
            extraMinutes := completionData.AccessPrepMinutes - 15
            extraHours := float64(extraMinutes) / 60.0

            // Create winter labor service line
            s.repo.CreateServiceLine(ctx, &ServiceLine{
                PropertyID:  property.ID,
                BookingID:   job.BookingID,
                Type:        "winter_labor",
                Date:        job.ScheduledDate,
                Description: fmt.Sprintf("Additional winter access prep (%d min)", extraMinutes),
                Quantity:    extraHours,
                Rate:        75.00,
                TaxType:     TaxTypeGSTOnly,
            })
        }
    }

    // ... rest of completion logic
}
```

### 8.2 Winter Laundry Delivery

Off-site laundry during winter non-vehicle access period incurs $25 delivery surcharge:

```go
if property.Category == "alpine_village" && GetSeason(date) == "winter" && laundryOffsite {
    // Add delivery surcharge
    s.repo.CreateServiceLine(ctx, &ServiceLine{
        PropertyID:  property.ID,
        Type:        "laundry",
        Description: "Winter laundry delivery surcharge",
        Quantity:    1,
        Rate:        25.00,
        TaxType:     TaxTypeGSTOnly,
    })
}
```

---

## 9. Domain Model Updates

### 9.1 New Enums (Go)

```go
// PropertyCategory represents the property type for pricing
type PropertyCategory string

const (
    PropertyCategoryCondo        PropertyCategory = "condo"
    PropertyCategoryChalet       PropertyCategory = "chalet"
    PropertyCategoryAlpineVillage PropertyCategory = "alpine_village"
)

// LinenType represents types of linens tracked
type LinenType string

const (
    LinenTypeSheetSet      LinenType = "sheet_set"
    LinenTypeDuvetCover    LinenType = "duvet_cover"
    LinenTypeDuvetInsert   LinenType = "duvet_insert"
    LinenTypeMattressPad   LinenType = "mattress_pad"
    LinenTypePillow        LinenType = "pillow"
    LinenTypePillowProtector LinenType = "pillow_protector"
    LinenTypeBodyTowel     LinenType = "body_towel"
    LinenTypeHandTowel     LinenType = "hand_towel"
    LinenTypeBathMat       LinenType = "bath_mat"
    LinenTypeKitchenTowel  LinenType = "kitchen_towel"
)

// BedSize represents bed sizes for linen tracking
type BedSize string

const (
    BedSizeTwin    BedSize = "twin"
    BedSizeDouble  BedSize = "double"
    BedSizeQueen   BedSize = "queen"
    BedSizeKing    BedSize = "king"
    BedSizeSofaBed BedSize = "sofa_bed"
)
```

### 9.2 Updated Property Struct

```go
type Property struct {
    // ... existing fields ...

    // Category & Pricing
    Category                PropertyCategory `json:"category" db:"category"`
    AssessmentComplete      bool             `json:"assessment_complete" db:"assessment_complete"`
    AssessmentTurnoverCount int              `json:"assessment_turnover_count" db:"assessment_turnover_count"`
    TurnoverRateAnnual      *float64         `json:"turnover_rate_annual,omitempty" db:"turnover_rate_annual"`
    TurnoverRateSummer      *float64         `json:"turnover_rate_summer,omitempty" db:"turnover_rate_summer"`
    TurnoverRateWinter      *float64         `json:"turnover_rate_winter,omitempty" db:"turnover_rate_winter"`
    WinterAccessAllowanceMin int             `json:"winter_access_allowance_min" db:"winter_access_allowance_min"`

    // Hot Tub Program
    HotTubProgramEnrolled   bool       `json:"hot_tub_program_enrolled" db:"hot_tub_program_enrolled"`
    HotTubLastDrainDate     *time.Time `json:"hot_tub_last_drain_date,omitempty" db:"hot_tub_last_drain_date"`
    HotTubNextDrainDate     *time.Time `json:"hot_tub_next_drain_date,omitempty" db:"hot_tub_next_drain_date"`
}
```

### 9.3 New Entity Structs

```go
type ServiceRate struct {
    ID            uuid.UUID  `json:"id" db:"id"`
    ServiceType   string     `json:"service_type" db:"service_type"`
    Description   string     `json:"description" db:"description"`
    Rate          float64    `json:"rate" db:"rate"`
    RateUnit      string     `json:"rate_unit" db:"rate_unit"`
    MinCharge     *float64   `json:"min_charge,omitempty" db:"min_charge"`
    EffectiveDate time.Time  `json:"effective_date" db:"effective_date"`
    ExpiryDate    *time.Time `json:"expiry_date,omitempty" db:"expiry_date"`
    CreatedAt     time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

type Consumable struct {
    ID         uuid.UUID `json:"id" db:"id"`
    Name       string    `json:"name" db:"name"`
    Category   string    `json:"category" db:"category"`
    IsStandard bool      `json:"is_standard" db:"is_standard"`
    Unit       *string   `json:"unit,omitempty" db:"unit"`
    CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type PropertyConsumable struct {
    ID           uuid.UUID  `json:"id" db:"id"`
    PropertyID   uuid.UUID  `json:"property_id" db:"property_id"`
    ConsumableID uuid.UUID  `json:"consumable_id" db:"consumable_id"`
    Enabled      bool       `json:"enabled" db:"enabled"`
    ParLevel     *int       `json:"par_level,omitempty" db:"par_level"`
    Notes        *string    `json:"notes,omitempty" db:"notes"`
    CreatedAt    time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`

    // Joined
    Consumable *Consumable `json:"consumable,omitempty" db:"-"`
}

type PropertyLinen struct {
    ID                    uuid.UUID  `json:"id" db:"id"`
    PropertyID            uuid.UUID  `json:"property_id" db:"property_id"`
    LinenType             LinenType  `json:"linen_type" db:"linen_type"`
    BedSize               *BedSize   `json:"bed_size,omitempty" db:"bed_size"`
    Location              *string    `json:"location,omitempty" db:"location"`
    Quantity              int        `json:"quantity" db:"quantity"`
    RequiredSets          int        `json:"required_sets" db:"required_sets"`
    Condition             string     `json:"condition" db:"condition"`
    LastDeepClean         *time.Time `json:"last_deep_clean,omitempty" db:"last_deep_clean"`
    TurnoversSinceLaunder int        `json:"turnovers_since_launder" db:"turnovers_since_launder"`
    Notes                 *string    `json:"notes,omitempty" db:"notes"`
    CreatedAt             time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`
}
```

---

## 10. API Endpoints

### 10.1 Property Endpoints (Extended)

```
PUT  /api/v1/properties/{id}/category
     Body: { "category": "alpine_village" }

PUT  /api/v1/properties/{id}/assessment/complete
     Body: {
       "turnover_rate_annual": 150.00,      // for condo
       "turnover_rate_summer": 175.00,      // for chalet/alpine
       "turnover_rate_winter": 200.00       // for chalet/alpine
     }

GET  /api/v1/properties/{id}/consumables
POST /api/v1/properties/{id}/consumables
     Body: { "consumable_id": "uuid", "enabled": true, "par_level": 5 }
PUT  /api/v1/properties/{id}/consumables/{consumable_id}

GET  /api/v1/properties/{id}/linens
POST /api/v1/properties/{id}/linens
PUT  /api/v1/properties/{id}/linens/{linen_id}
DELETE /api/v1/properties/{id}/linens/{linen_id}
```

### 10.2 Service Rates Endpoints

```
GET  /api/v1/service-rates
GET  /api/v1/service-rates/{service_type}
PUT  /api/v1/service-rates/{service_type}  (admin only)
```

### 10.3 Cleaning Job Endpoints (Extended)

```
POST /api/v1/jobs/{id}/cancel
     Body: { "reason": "Guest cancelled booking" }
     Response: { "cancellation_fee": 75.00 }

POST /api/v1/jobs/{id}/complete
     Body: {
       "duration_hours": 2.5,
       "access_prep_minutes": 20,  // for winter access tracking
       "consumables": [
         { "consumable_id": "uuid", "quantity_used": 2, "needs_restock": true }
       ],
       "hot_tub_status": "Clean, 104F",
       "damage_notes": null,
       "restock_notes": "Low on toilet paper"
     }
```

### 10.4 Consumables Endpoints

```
GET  /api/v1/consumables           // Master list
GET  /api/v1/consumables/standard  // Standard items only
```

---

## 11. Admin Dashboard Updates

### 11.1 Properties List View

Add columns/filters:
- Category badge (Condo/Chalet/Alpine Village)
- Assessment status (In Assessment / Complete)
- Hot Tub Program badge

### 11.2 Property Detail View

New sections:
- **Pricing**: Category, rates (annual or seasonal), assessment progress
- **Hot Tub Program**: Enrollment status, drain schedule
- **Consumables Checklist**: Configurable list with par levels
- **Linen Inventory**: By location/bed with rotation alerts

### 11.3 Cleaning Job Detail View

New fields:
- Cancellation fee (if cancelled)
- Winter access prep time (Alpine Village)
- Consumables used/restocking needed
- Linen rotation alerts

---

## 12. Migration Strategy

### 12.1 Migration Order

1. Add new enums
2. Add columns to properties table
3. Create service_rates table with seed data
4. Create consumables table with seed data
5. Create property_consumables table
6. Create linen tables
7. Add columns to cleaning_jobs table
8. Update job_status enum

### 12.2 Data Migration

For existing properties:
- Default category to `condo`
- Set `assessment_complete = true` (assume existing properties have established rates)
- Copy existing `cleaning_fee` to `turnover_rate_annual`
- Auto-enable standard consumables

---

## 13. Testing Strategy

### 13.1 Unit Tests

- `GetSeason()` function with boundary dates
- `GetTurnoverRate()` for each category and season
- `CalculateCancellationFee()` for each notice period bracket
- Linen rotation alert generation

### 13.2 Integration Tests

- Property category change workflow
- Assessment completion workflow
- Job cancellation with fee calculation
- Consumables tracking through job completion
- Winter labor surcharge calculation

---

## 14. Open Questions

1. **Stock-up scheduling**: Should the platform auto-schedule the 4 annual stock-ups, or just track them manually?

2. **Hot tub drain scheduling**: Auto-schedule based on seasons, or manual entry?

3. **Linen replacement workflow**: Should flagging linens for replacement create a purchase order or just an alert?

4. **Rate changes**: When rates change mid-season, should in-progress bookings use old or new rates?

---

## 15. Future Considerations

- **Mobile app**: Consumables and linen tracking during turnover
- **Automated alerts**: Low consumables, overdue linen rotation, upcoming stock-up dates
- **Owner portal**: Show service charges, consumables usage
- **Reporting**: Cost analysis by property category, seasonal comparisons
