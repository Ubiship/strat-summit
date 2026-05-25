# 02 — Payout Engine

The payout engine is the most complex piece of the platform. It replicates and
automates the manual Excel-based process Joel currently runs monthly for Tier 3
properties. The source of truth is `Cozy_Bear_Payout_January_2026.xlsx`, which
has two tabs: **Breakdown** (internal) and **Owner Payout** (client-facing).

This spec defines every calculation, tax rule, edge case, and output format.

---

## Overview

The engine runs in two stages:

1. **Accumulation** — service lines and booking records accumulate throughout
   the month as jobs are completed and bookings are confirmed.

2. **Statement Generation** — triggered manually (admin) or by cron on the 1st
   of each month. Reads all records for the period, runs calculations, generates
   the PDF, and emails the owner.

---

## Booking Source → Tax Treatment

This is the most critical rule. Tax logic is determined entirely by booking source.

| Source | tax_treatment | GST | PST | MRDT | Notes |
|---|---|---|---|---|---|
| `airbnb` | `airbnb_managed` | 0 | 0 | 0 | Airbnb remits all taxes directly to CRA |
| `vrbo` | `airbnb_managed` | 0 | 0 | 0 | Same as Airbnb |
| `direct` | `direct` | 5% | 7% | 3% | SS must collect and remit |
| `platform` | `direct` | 5% | 7% | 3% | Booked via SS platform, same as direct |
| `owner_use` | `none` | 0 | 0 | 0 | No revenue. Expenses charged to owner only |

> **Tax rates (BC):**
> - GST: 5% of revenue excl. cleaning fee
> - PST: 7% of revenue excl. cleaning fee (accommodations)
> - MRDT: 3% of revenue excl. cleaning fee (Municipal Regional District Tax)
>
> Verified from January 2026 payout: Private - Evelyn booking shows
> GST=$113.75, PST=$159.25, MRDT=$68.25 on $2,275 taxable revenue.

---

## Revenue Calculations

### Revenue Including Cleaning Fee
```
revenue_incl_cleaning_fee = (nightly_rate × nights) + cleaning_fee_charged
```

### Revenue Excluding Cleaning Fee (commission basis)
```
revenue_excl_cleaning_fee = nightly_rate × nights
```

### Tax (direct bookings only)
```
gst  = revenue_excl_cleaning_fee × 0.05
pst  = revenue_excl_cleaning_fee × 0.07
mrdt = revenue_excl_cleaning_fee × 0.03
```

### Commission
```
commission = revenue_excl_cleaning_fee × commission_rate
```

> The cleaning fee is NOT commissionable. It is charged to the guest and passes
> through as an expense line against the owner — it pays for the clean.
> commission_rate = 0.20 (20%) for all current properties.

---

## Service Line Calculations

### Cleaning
```
subtotal = hours × hourly_rate         // $55.00/hr
gst      = subtotal × 0.05
total    = subtotal + gst
tax_type = 'gst_only'
```

### Laundry
```
subtotal = units × unit_rate           // $2.75/unit (load or kg — confirm with Joel)
gst      = subtotal × 0.05
total    = subtotal + gst
tax_type = 'gst_only'
```

### Shoveling
```
subtotal = hours × hourly_rate         // $65.00/hr
gst      = subtotal × 0.05
total    = subtotal + gst
tax_type = 'gst_only'
```

### Maintenance
```
subtotal = hours × hourly_rate         // rate TBD — confirm with Joel
gst      = subtotal × 0.05
total    = subtotal + gst
tax_type = 'gst_only'
```

### Purchases / Restocking
```
subtotal = cost_price × (1 + 0.20)    // 20% markup on supplies
gst      = subtotal × 0.05
pst      = subtotal × 0.07            // PST applies to physical goods
total    = subtotal + gst + pst
tax_type = 'gst_pst'
```

> **Important:** PST applies to materials/purchases but NOT to labour/services.
> The markup (20%) is applied before tax. Verified from spreadsheet structure.

---

## Owner Payout Net Calculation

```
owner_payout_net =
    revenue_incl_cleaning_fee          // total guest revenue
  - commission_total                   // SS commission
  - gst_collected                      // remitted to CRA (direct bookings)
  - pst_collected                      // remitted to province
  - mrdt_collected                     // remitted to municipality
  - expenses_cleaning                  // cleaning costs
  - expenses_laundry                   // laundry costs
  - expenses_shoveling                 // shoveling costs
  - expenses_maintenance               // maintenance costs
  - expenses_purchases                 // supply restocking (incl. markup + tax)
```

> **Owner use periods (owner_use source):**
> Revenue = 0. All expenses during the period still charged.
> Owner payout will be negative (owner owes SS for services rendered).
> Verified: Randy & Brooke entries in Jan 2026 show negative payouts of
> -$245.44, -$321.96, -$320.25.

---

## Go Implementation

### Package structure
```
backend/internal/service/payout/
├── engine.go          // main StatementCalculator
├── booking.go         // per-booking revenue + tax calc
├── service_line.go    // per-line subtotal + tax calc
├── statement.go       // aggregation + net payout
└── pdf.go             // PDF generation
```

### Core types
```go
type BookingCalculation struct {
    BookingID              uuid.UUID
    Source                 BookingSource
    TaxTreatment           TaxTreatment
    RevenueInclFee         decimal.Decimal
    RevenueExclFee         decimal.Decimal
    CommissionRate         decimal.Decimal
    CommissionAmount       decimal.Decimal
    GST                    decimal.Decimal
    PST                    decimal.Decimal
    MRDT                   decimal.Decimal
}

type ServiceLineCalculation struct {
    ServiceLineID  uuid.UUID
    Type           ServiceLineType
    Quantity       decimal.Decimal
    Rate           decimal.Decimal
    MarkupRate     decimal.Decimal
    Subtotal       decimal.Decimal
    GST            decimal.Decimal
    PST            decimal.Decimal
    Total          decimal.Decimal
}

type StatementResult struct {
    PropertyID             uuid.UUID
    PropertyOwnerID        uuid.UUID
    PeriodStart            time.Time
    PeriodEnd              time.Time
    Bookings               []BookingCalculation
    ServiceLines           []ServiceLineCalculation
    TotalRevenueInclFee    decimal.Decimal
    TotalRevenueExclFee    decimal.Decimal
    CommissionTotal        decimal.Decimal
    GSTCollected           decimal.Decimal
    PSTCollected           decimal.Decimal
    MRDTCollected          decimal.Decimal
    ExpensesCleaning       decimal.Decimal
    ExpensesLaundry        decimal.Decimal
    ExpensesShoveling      decimal.Decimal
    ExpensesMaintenance    decimal.Decimal
    ExpensesPurchases      decimal.Decimal
    ExpensesTotal          decimal.Decimal
    OwnerPayoutNet         decimal.Decimal
}
```

> Use `github.com/shopspring/decimal` for all monetary arithmetic.
> Never use float64 for money.

### Engine interface
```go
type StatementCalculator interface {
    Calculate(ctx context.Context, propertyID uuid.UUID, period StatementPeriod) (*StatementResult, error)
    GeneratePDF(result *StatementResult) ([]byte, error)
    Publish(ctx context.Context, result *StatementResult) error // save + email + QBO sync
}
```

---

## Statement Period

### Manual trigger (admin)
`POST /api/v1/properties/{id}/statements/generate`
Body: `{ "period_start": "2026-01-01", "period_end": "2026-01-31" }`

### Cron trigger
Runs on 1st of each month at 09:00 local time.
Generates statements for all Tier 3 properties with `active = true`.

```
STATEMENT_CRON=0 9 1 * *
```

---

## PDF Output

Two pages, matching the existing spreadsheet structure:

### Page 1 — Owner Payout (client-facing)

Header:
```
[Property Name]
Owner Statement — [Month Year]
Prepared by Strathcona Summit Solutions
```

Bookings table:
| Date | Guest | Platform | Nights | Revenue (incl. fee) | Revenue (excl. fee) | Commission | Taxes |
|---|---|---|---|---|---|---|---|

Expenses table:
| Date | Description | Booking Ref | Hours/Units | Rate | Amount |
|---|---|---|---|---|---|

Summary:
```
Total Revenue (incl. cleaning fee):  $XX,XXX.XX
Total Commission (20%):             -$X,XXX.XX
Taxes Collected & Remitted:         -$XXX.XX
Total Expenses:                     -$X,XXX.XX
─────────────────────────────────────────────
NET OWNER PAYOUT:                    $X,XXX.XX
```

### Page 2 — Internal Breakdown

Full service line detail with tax breakdowns.
Not included in owner email. Admin-only view in portal.

---

## PDF Generation

Use `github.com/jung-kurt/gofpdf` or `github.com/go-pdf/fpdf`.

```go
func (e *engine) GeneratePDF(result *StatementResult) ([]byte, error) {
    pdf := gofpdf.New("P", "mm", "A4", "")
    // ... build owner payout page
    // ... build breakdown page (watermarked INTERNAL)
    var buf bytes.Buffer
    err := pdf.Output(&buf)
    return buf.Bytes(), err
}
```

PDF stored to MinIO `statements` bucket:
```
statements/{property_id}/{year}/{month}/owner_statement.pdf
statements/{property_id}/{year}/{month}/breakdown_internal.pdf
```

Signed URL generated at access time (not stored).

---

## Email Delivery

After PDF generation, send via Resend:

```go
type StatementEmail struct {
    To          string   // property_owners.statement_email
    Subject     string   // "Cozy Bear — January 2026 Owner Statement"
    PayoutAmount decimal.Decimal
    PDFPath     string
}
```

Template (plain-English, not corporate):
```
Hi [Owner First Name],

Here's your statement for [Property Name] for [Month Year].

Your payout for the month is [amount]. An e-transfer has been sent
to [email/account on file].

The full breakdown is attached. Reach out if you have any questions.

Joel & Amanda
Strathcona Summit Solutions
```

---

## QBO Sync

After statement is finalised and sent:

1. Create a QBO Invoice for the commission earned (SS revenue)
2. Create QBO expense entries for any SS-paid costs
3. Record owner payout as a QBO bill payment

> **Do not duplicate:** QBO bookkeeper already reconciles bank transactions.
> Tag all SS-generated QBO entries with a custom field: `source: "strathcona_platform"`
> so bookkeeper can identify and avoid double-entry.
> Confirm sync approach with bookkeeper before activating.

---

## Validation Rules

Before generating a statement, engine must verify:

- [ ] All `cleaning_jobs` in period have `status = 'complete'`
- [ ] All `service_lines` for the period have non-null `quantity` and `rate`
- [ ] No overlapping bookings for the property in the period
- [ ] `commission_rate` is set on the property or service agreement
- [ ] At least one booking or service line exists in the period
- [ ] `property_owner.statement_email` is set

If validation fails, return structured errors. Do not generate partial statements.

---

## Edge Cases

| Case | Handling |
|---|---|
| Owner use period (no revenue) | Revenue = 0, expenses still calculated. Payout is negative (owner owes). Flag clearly on statement. |
| Mid-month rate change | Use rate snapshot at time of booking/job. Never recalculate historical records. |
| Partial month (property onboarded mid-month) | Pro-rate from onboarding date. period_start = onboarding date. |
| Booking spans two months | Attribute to checkout month. Revenue and associated service lines in same period. |
| Cancelled booking | Exclude from revenue. Associated CleaningJob marked cancelled. Expenses still charged if work was performed. |
| Co-owned property | Generate separate statement per owner with equity_share applied to payout. |
| Missing service lines | Flag to admin before generation. Do not auto-estimate missing work. |

---

## Current Manual Process (reference)

Joel's existing workflow (from discovery doc) — what we are replacing:

1. Duplicate Excel template from OneDrive
2. Open Google Calendar, enter activity day-by-day into Breakdown tab
3. Manually enter each booking into Owner Payout tab
4. Calculate nightly rates by season (weekday/weekend/holiday)
5. Apply tax logic per booking source manually
6. Transfer expenses from Breakdown to Owner Payout tab manually
7. Review all formulas manually
8. Export PDF, email owner, send e-transfer

**Joel's stated concerns with current process:**
- High risk of manual errors
- Formulas not fully trusted
- No invoices for services or revenue
- No QBO integration
- Money flow not clearly tracked

All of the above are solved by this engine.

---

## Open Items

- [ ] Confirm laundry unit (load vs. kg vs. flat rate)
- [ ] Confirm maintenance hourly rate
- [ ] Confirm nightly rate logic for seasonal/weekend/holiday pricing
  (spreadsheet shows flat nightly rate — are rates stored per-booking or calculated?)
- [ ] Co-ownership: no co-owned properties currently, but design for it
- [ ] QBO sync: get bookkeeper approval on entry tagging approach
- [ ] Direct booking intake: how do nightly rates get set? Manual on booking creation?
