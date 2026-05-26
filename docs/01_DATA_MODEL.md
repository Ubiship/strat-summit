# 01 — Data Model

All tables live in self-hosted PostgreSQL on Railway. Access control enforced
at the Go service layer via JWT claims. `created_at` / `updated_at` on every
table via trigger.

---

## Enums

```sql
CREATE TYPE service_tier       AS ENUM ('1','2','3');
CREATE TYPE booking_source     AS ENUM ('airbnb','vrbo','direct','owner_use','platform');
CREATE TYPE tax_treatment      AS ENUM ('airbnb_managed','direct','none');
CREATE TYPE service_line_type  AS ENUM ('cleaning','laundry','shoveling','maintenance','purchase','restock');
CREATE TYPE tax_type           AS ENUM ('gst_only','gst_pst','gst_pst_mrdt','none');
CREATE TYPE statement_status   AS ENUM ('draft','sent','paid');
CREATE TYPE job_status         AS ENUM ('assigned','in_progress','complete','flagged');
CREATE TYPE comp_model         AS ENUM ('hourly','per_job');
CREATE TYPE project_status     AS ENUM ('estimate','booked','in_progress','complete','cancelled');
CREATE TYPE billing_model      AS ENUM ('fixed','cost_plus','t_and_m');
CREATE TYPE change_order_status AS ENUM ('pending','approved','rejected');
CREATE TYPE user_role          AS ENUM ('admin','cleaner','cleaning_client','pm_owner','renovation_client','subtrade','bookkeeper');
CREATE TYPE photo_visibility   AS ENUM ('internal','owner','public');
CREATE TYPE agreement_type     AS ENUM ('cleaning','pm','renovation_fixed','renovation_cost_plus','renovation_t_and_m');
```

---

## Core / Shared

### contacts
All people in the system. Staff, owners, clients, subtrades are all contacts
with a role. Avoids duplicate person records across domains.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| email | text UNIQUE | |
| phone | text | |
| company_name | text | for subtrades and business clients |
| role | user_role NOT NULL | drives portal access |
| notes | text | internal only |
| chatwoot_contact_id | bigint UNIQUE | synced from Chatwoot on create/match |

### users
All accounts provisioned by UbiShip admin. No self-signup.

| field | type | notes |
|---|---|---|
| id | uuid PK DEFAULT gen_random_uuid() | |
| contact_id | uuid FK contacts NOT NULL | |
| email | text UNIQUE NOT NULL | login identifier |
| password_hash | text NOT NULL | bcrypt, cost=12 |
| role | user_role NOT NULL | drives all access control |
| refresh_token_hash | text | latest valid refresh token (hashed) — rotated on use |
| refresh_token_expires_at | timestamptz | |
| last_login_at | timestamptz | |
| active | bool DEFAULT true | set false to disable without deleting |
| created_at | timestamptz DEFAULT now() | |
| updated_at | timestamptz DEFAULT now() | |

> **Token strategy:**
> - Access token: JWT, 15 min TTL, signed with `JWT_SECRET`
> - Refresh token: opaque random string, 30 day TTL, stored bcrypt-hashed in DB
> - Refresh rotates on every use — old token invalidated immediately
> - `active = false` blocks all token validation at middleware layer
>
> **JWT claims:**
> ```json
> {
>   "sub": "user-uuid",
>   "role": "admin",
>   "contact_id": "contact-uuid",
>   "exp": 1234567890,
>   "iat": 1234567890
> }
> ```
>
> **Auth middleware (Go):** Validates JWT on every request. Extracts claims
> into request context. Role checks happen in service layer, not middleware.

---

## Property Management Domain

### properties

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | e.g. "Cozy Bear Chalet" |
| address | text NOT NULL | |
| tier | service_tier NOT NULL | 1, 2, or 3 |
| commission_rate | numeric(5,4) DEFAULT 0.20 | e.g. 0.20 = 20% |
| cleaning_fee | numeric(10,2) DEFAULT 300.00 | flat fee charged per booking |
| cleaning_fee_commissionable | bool DEFAULT false | almost always false |
| airbnb_ical_url | text | polling source |
| vrbo_ical_url | text | polling source |
| wifi_password | text | |
| access_codes | jsonb | `{"front_door":"1234","garage":"5678"}` |
| hot_tub | bool DEFAULT false | triggers required photo on job |
| hot_tub_temp_f | int DEFAULT 104 | |
| notes | text | internal operational notes |
| supply_list | jsonb | property-specific supply requirements |
| checklist_template_id | uuid FK checklist_templates | |
| active | bool DEFAULT true | |

### property_owners
Junction between contacts and properties. Supports co-ownership.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| contact_id | uuid FK contacts | |
| equity_share | numeric(5,4) DEFAULT 1.0 | for co-ownership splits |
| portal_access | bool DEFAULT false | enable owner portal |
| statement_email | text | can differ from contact email |

### service_agreements

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| contact_id | uuid FK contacts | signing party |
| tier | service_tier NOT NULL | |
| type | agreement_type NOT NULL | |
| monthly_rate | numeric(10,2) | if applicable |
| commission_rate | numeric(5,4) | can override property default |
| effective_date | date NOT NULL | |
| expiry_date | date | null = ongoing |
| dropbox_sign_id | text | signature request ID |
| signed_at | timestamptz | |
| document_key | text | MinIO object key in 'contracts' bucket |
| status | text DEFAULT 'pending' | pending, active, expired, cancelled |

### bookings

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| source | booking_source NOT NULL | |
| tax_treatment | tax_treatment NOT NULL | derived from source on insert |
| external_uid | text | iCal UID for dedup |
| guest_name | text | |
| guest_email | text | |
| guest_phone | text | |
| check_in | date NOT NULL | |
| check_out | date NOT NULL | |
| nights | int GENERATED | check_out - check_in |
| nightly_rate | numeric(10,2) | |
| nightly_rate_weekend | numeric(10,2) | if different |
| nightly_rate_holiday | numeric(10,2) | if different |
| revenue_incl_cleaning_fee | numeric(10,2) | total charged to guest |
| revenue_excl_cleaning_fee | numeric(10,2) | base for commission calc |
| cleaning_fee_charged | numeric(10,2) | snapshot at time of booking |
| gst | numeric(10,2) DEFAULT 0 | 0 for Airbnb |
| pst | numeric(10,2) DEFAULT 0 | 0 for Airbnb |
| mrdt | numeric(10,2) DEFAULT 0 | 0 for Airbnb |
| notes | text | |
| cleaning_job_id | uuid FK cleaning_jobs | auto-created on booking confirm |
| statement_id | uuid FK owner_statements | assigned during month-end |
| chatwoot_conversation_id | bigint | linked inbox thread for this booking |

> **Tax derivation on INSERT:**
> - source = 'airbnb' OR 'vrbo' → tax_treatment = 'airbnb_managed', all taxes = 0
> - source = 'direct' OR 'platform' → tax_treatment = 'direct', GST+PST+MRDT applied
> - source = 'owner_use' → tax_treatment = 'none', revenue = 0

### cleaning_jobs

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| booking_id | uuid FK bookings NULLABLE | null for standalone cleans |
| scheduled_date | date NOT NULL | |
| scheduled_time | time | |
| status | job_status DEFAULT 'assigned' | |
| comp_model | comp_model DEFAULT 'hourly' | |
| job_rate | numeric(10,2) | used if comp_model = per_job |
| duration_hours | numeric(5,2) | actual logged hours |
| arrived_at | timestamptz | clock in |
| completed_at | timestamptz | clock out |
| checklist_data | jsonb | completed checklist state |
| checklist_completion_pct | int GENERATED | computed from checklist_data |
| hot_tub_photo_required | bool | copied from property on job create |
| hot_tub_status | text | note from cleaner |
| damage_notes | text | |
| restock_notes | text | |
| internal_notes | text | |
| dispatched_at | timestamptz | when Twilio SMS sent |

### cleaning_job_staff
Many-to-many: cleaners assigned to a job.

| field | type | notes |
|---|---|---|
| job_id | uuid FK cleaning_jobs | |
| contact_id | uuid FK contacts | must have role = 'cleaner' |
| hours_logged | numeric(5,2) | |
| hourly_rate | numeric(10,2) | snapshot at time of job |

### checklist_templates

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | e.g. "Standard Chalet" |
| rooms | jsonb NOT NULL | full checklist structure (see below) |
| version | int DEFAULT 1 | |

> **Checklist JSONB structure:**
> ```json
> {
>   "rooms": [
>     {
>       "name": "Bathroom",
>       "every_time": ["Spray mirror with Windex", "..."],
>       "check_every_time": ["Do any windows need washing", "..."],
>       "restock": ["Hand soap", "Hand towels", "..."]
>     }
>   ]
> }
> ```
> Room types from source doc: Bathroom, Bedroom, Kitchen, Living Room,
> Dining Room, Patio, Entry/Mud Room, Laundry/Supply, Garage.
> Property-specific overrides stored on `properties.supply_list`.

### photos

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| job_id | uuid FK cleaning_jobs NULLABLE | |
| project_id | uuid FK projects NULLABLE | |
| uploaded_by | uuid FK contacts | |
| bucket | text NOT NULL | 'photos', 'documents' |
| storage_key | text NOT NULL | MinIO object key e.g. `photos/{property_id}/{job_id}/{uuid}.jpg` |
| content_type | text DEFAULT 'image/jpeg' | |
| size_bytes | bigint | |
| visibility | photo_visibility DEFAULT 'internal' | |
| room | text | "bathroom", "hot_tub", "damage", etc. |
| caption | text | |
| taken_at | timestamptz | |
| is_required | bool DEFAULT false | hot tub photos = true |

> **Presigned URL generation:** Never store signed URLs. Generate on demand
> via `minio-go/v7` `PresignedGetObject` with 15-min TTL.
> Storage key format: `{property_id}/{job_id}/{uuid}.{ext}`

### service_lines
Line items on the internal Breakdown tab. Attached to a booking or standalone.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| booking_id | uuid FK bookings NULLABLE | |
| statement_id | uuid FK owner_statements NULLABLE | |
| type | service_line_type NOT NULL | |
| date | date NOT NULL | |
| description | text | |
| quantity | numeric(8,2) NOT NULL | hours or units |
| rate | numeric(10,2) NOT NULL | per hour or per unit |
| markup_rate | numeric(5,4) DEFAULT 0 | 0.20 for purchases |
| subtotal | numeric(10,2) GENERATED | quantity * rate * (1 + markup_rate) |
| tax_type | tax_type NOT NULL | |
| gst | numeric(10,2) GENERATED | |
| pst | numeric(10,2) GENERATED | materials/purchases only |
| total | numeric(10,2) GENERATED | subtotal + gst + pst |

> **Service line rates (from payout spreadsheet):**
> - cleaning: $55.00/hr, GST only
> - laundry: $2.75/unit (load or kg), GST only
> - shoveling: $65.00/hr, GST only
> - maintenance: rate TBD, GST only
> - purchase/restock: cost price + 20% markup, GST + PST

### owner_statements

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK properties | |
| property_owner_id | uuid FK property_owners | |
| period_start | date NOT NULL | |
| period_end | date NOT NULL | |
| total_revenue_incl_fee | numeric(10,2) | sum of booking revenues |
| total_revenue_excl_fee | numeric(10,2) | commission basis |
| commission_rate | numeric(5,4) | snapshot at statement time |
| commission_total | numeric(10,2) | |
| gst_collected | numeric(10,2) | direct bookings only |
| pst_collected | numeric(10,2) | direct bookings only |
| mrdt_collected | numeric(10,2) | direct bookings only |
| expenses_cleaning | numeric(10,2) | |
| expenses_laundry | numeric(10,2) | |
| expenses_shoveling | numeric(10,2) | |
| expenses_maintenance | numeric(10,2) | |
| expenses_purchases | numeric(10,2) | incl. 20% markup |
| expenses_total | numeric(10,2) | sum of all expense categories |
| owner_payout_net | numeric(10,2) | revenue - commission - expenses |
| status | statement_status DEFAULT 'draft' | |
| pdf_key | text | MinIO object key in 'statements' bucket |
| sent_at | timestamptz | |
| qbo_invoice_id | text | after QBO sync |

---

## Renovations Domain

### projects

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| contact_id | uuid FK contacts | client |
| name | text NOT NULL | e.g. "Smith Kitchen Reno" |
| address | text | job site if different from client |
| status | project_status DEFAULT 'estimate' | |
| billing_model | billing_model NOT NULL | |
| description | text | scope of work |
| start_date | date | |
| estimated_end_date | date | |
| actual_end_date | date | |
| deposit_pct | numeric(5,4) DEFAULT 0.50 | e.g. 0.50 = 50% |
| deposit_amount | numeric(10,2) | |
| deposit_paid_at | date | |
| total_estimate | numeric(10,2) | from accepted estimate |
| total_invoiced | numeric(10,2) | |
| total_paid | numeric(10,2) | |
| margin_target_pct | numeric(5,4) | |
| notes | text | internal |
| chatwoot_conversation_id | bigint | linked inbox thread for this project |

### estimates

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK projects | |
| version | int DEFAULT 1 | increments on revision |
| status | text DEFAULT 'draft' | draft, sent, accepted, rejected, superseded |
| valid_until | date | |
| subtotal_materials | numeric(10,2) | |
| subtotal_labour | numeric(10,2) | |
| margin_amount | numeric(10,2) | |
| gst | numeric(10,2) | |
| total | numeric(10,2) | |
| notes | text | client-visible notes |
| internal_notes | text | |
| dropbox_sign_id | text | on acceptance |
| signed_at | timestamptz | |
| qbo_estimate_id | text | after QBO sync |

### estimate_line_items

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| estimate_id | uuid FK estimates | |
| type | text NOT NULL | 'material' or 'labour' |
| description | text NOT NULL | |
| quantity | numeric(8,2) NOT NULL | |
| unit | text | hrs, sqft, each, etc. |
| unit_cost | numeric(10,2) NOT NULL | |
| margin_pct | numeric(5,4) DEFAULT 0 | applied to materials |
| subtotal | numeric(10,2) GENERATED | |
| supplier | text | e.g. "Home Depot" |
| notes | text | |

### contracts

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK projects | |
| estimate_id | uuid FK estimates | derived from accepted estimate |
| type | agreement_type NOT NULL | renovation_fixed, renovation_cost_plus, renovation_t_and_m |
| status | text DEFAULT 'pending' | pending, active, complete, cancelled |
| dropbox_sign_id | text | |
| signed_at | timestamptz | |
| document_key | text | MinIO object key in 'contracts' bucket |

### change_orders

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK projects | |
| contract_id | uuid FK contracts | |
| version | int NOT NULL | sequential per project |
| description | text NOT NULL | what changed and why |
| delta_materials | numeric(10,2) DEFAULT 0 | can be negative |
| delta_labour | numeric(10,2) DEFAULT 0 | |
| delta_total | numeric(10,2) GENERATED | |
| status | change_order_status DEFAULT 'pending' | |
| dropbox_sign_id | text | |
| signed_at | timestamptz | |
| document_key | text | MinIO object key in 'contracts' bucket |

### project_milestones

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK projects | |
| name | text NOT NULL | e.g. "Rough-in complete" |
| description | text | |
| pct_of_total | numeric(5,4) | e.g. 0.40 = 40% |
| fixed_amount | numeric(10,2) | alternative to pct |
| due_date | date | |
| completed_at | timestamptz | |
| invoice_id | text | QBO invoice ID after push |
| invoiced_at | timestamptz | |
| paid_at | timestamptz | |

### subtrades

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| contact_id | uuid FK contacts | |
| trade_type | text NOT NULL | electrical, plumbing, framing, etc. |
| insurance_provider | text | |
| insurance_policy_num | text | |
| insurance_expiry | date | |
| default_rate | numeric(10,2) | hourly rate |
| notes | text | |
| active | bool DEFAULT true | |

### project_subtrades
Junction: subtrades assigned to a project phase.

| field | type | notes |
|---|---|---|
| project_id | uuid FK projects | |
| subtrade_id | uuid FK subtrades | |
| phase | text | which phase/milestone they're on |
| agreed_rate | numeric(10,2) | can differ from default |
| notes | text | |

---

## Financial / QBO

### expenses
Receipt-captured expenses pending QBO push.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| submitted_by | uuid FK contacts | |
| property_id | uuid FK properties NULLABLE | |
| project_id | uuid FK projects NULLABLE | |
| date | date NOT NULL | |
| vendor | text | AI-extracted from receipt |
| description | text | AI-extracted or manual |
| amount | numeric(10,2) NOT NULL | |
| gst | numeric(10,2) DEFAULT 0 | |
| pst | numeric(10,2) DEFAULT 0 | |
| qbo_category | text | mapped to QBO chart of accounts |
| receipt_key | text | MinIO object key in 'receipts' bucket |
| ai_confidence | numeric(3,2) | 0-1, from vision API extraction |
| status | text DEFAULT 'pending' | pending, approved, pushed, rejected |
| qbo_expense_id | text | after push |
| pushed_at | timestamptz | |

---

## AI Domain

### vapi_calls

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| vapi_call_id | text UNIQUE | from VAPI webhook |
| caller_number | text | |
| direction | text DEFAULT 'inbound' | |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| duration_sec | int | |
| transcript | text | full call transcript |
| summary | text | AI-generated summary |
| outcome | text | booked, inquiry, transferred, voicemail |
| booking_id | uuid FK bookings NULLABLE | if call resulted in booking |
| contact_id | uuid FK contacts NULLABLE | if caller matched |
| property_id | uuid FK properties NULLABLE | if property identified |
| transferred_to | text | number if transferred |

### ai_reports

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| type | text NOT NULL | 'weekly' or 'monthly' |
| period_start | date | |
| period_end | date | |
| generated_at | timestamptz | |
| content_md | text | markdown body of report |
| sent_to | text[] | email addresses |
| sent_at | timestamptz | |
| resend_message_id | text | |

---

## Laundromat (Stub)

### laundromat_locations

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| address | text | |
| active | bool DEFAULT false | |

### laundromat_machines

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| location_id | uuid FK laundromat_locations | |
| type | text | 'washer' or 'dryer' |
| machine_number | text | |
| active | bool DEFAULT true | |

---

## Scheduling

### consultations
Created via Cal.com webhook on booking confirmed.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| contact_id | uuid FK contacts NOT NULL | |
| project_id | uuid FK projects NULLABLE | linked after project created |
| cal_booking_uid | text UNIQUE NOT NULL | Cal.com booking reference |
| event_type | text NOT NULL | renovation-consultation, property-walkthrough, estimate-review |
| start_time | timestamptz NOT NULL | |
| end_time | timestamptz NOT NULL | |
| status | text DEFAULT 'confirmed' | confirmed, cancelled, rescheduled, completed |
| notes | text | attendee notes from Cal.com form |
| chatwoot_conversation_id | bigint | opened automatically on booking |
| outcome | text | filled by admin after meeting |
| project_created | bool DEFAULT false | flag when project record is created post-consultation |

---

## Notifications

No separate notification table. Novu handles delivery state and history
internally. `contacts.id::text` is used as the Novu `subscriberId` — no
extra field needed.

Novu subscriber is upserted on every Contact create/update:
```go
novu.UpsertSubscriber(ctx, novu.Subscriber{
    SubscriberID: contact.ID.String(), // UUID as string
    Email:        contact.Email,
    Phone:        contact.Phone,
    FirstName:    contact.FirstName,
    LastName:     contact.LastName,
})
```

---

## Chatwoot Sync

### chatwoot_events
Audit log of all inbound Chatwoot webhooks. Enables idempotent processing
and replay on failure.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| chatwoot_event_type | text NOT NULL | conversation_created, conversation_resolved, message_created, contact_created, etc. |
| chatwoot_conversation_id | bigint | |
| chatwoot_contact_id | bigint | |
| payload | jsonb NOT NULL | full raw webhook payload |
| processed | bool DEFAULT false | |
| processed_at | timestamptz | |
| error | text | if processing failed |
| contact_id | uuid FK contacts NULLABLE | matched contact in our DB |
| booking_id | uuid FK bookings NULLABLE | matched booking |
| project_id | uuid FK projects NULLABLE | matched project |

---

## Key Indexes

```sql
-- Chatwoot sync
CREATE INDEX idx_contacts_chatwoot_id ON contacts(chatwoot_contact_id);
CREATE INDEX idx_chatwoot_events_processed ON chatwoot_events(processed) WHERE processed = false;
CREATE INDEX idx_chatwoot_events_conversation ON chatwoot_events(chatwoot_conversation_id);

-- Booking lookups
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_external_uid ON bookings(external_uid);

-- Job lookups
CREATE INDEX idx_cleaning_jobs_property_id ON cleaning_jobs(property_id);
CREATE INDEX idx_cleaning_jobs_scheduled_date ON cleaning_jobs(scheduled_date);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);

-- Statement lookups
CREATE INDEX idx_owner_statements_property_id ON owner_statements(property_id);
CREATE INDEX idx_owner_statements_period ON owner_statements(period_start, period_end);

-- Project lookups
CREATE INDEX idx_projects_contact_id ON projects(contact_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Service lines
CREATE INDEX idx_service_lines_booking_id ON service_lines(booking_id);
CREATE INDEX idx_service_lines_statement_id ON service_lines(statement_id);
```

---

## Access Control

No database-level RLS. All access control enforced at the Go service layer.

**Pattern:** JWT middleware extracts `role` and `user_id` from token into
request context. Service methods accept a `*domain.AuthContext` and enforce
role checks before any DB query executes.

```go
type AuthContext struct {
    UserID    uuid.UUID
    ContactID uuid.UUID
    Role      UserRole
}

// Example: service enforces role before querying
func (s *Service) GetOwnerStatement(ctx context.Context, auth *AuthContext, id uuid.UUID) (*OwnerStatement, error) {
    stmt, err := s.repo.GetStatement(ctx, id)
    if err != nil { return nil, err }

    switch auth.Role {
    case RoleAdmin:
        return stmt, nil
    case RolePMOwner:
        // verify this owner has access to this property
        if !s.repo.OwnerHasProperty(ctx, auth.ContactID, stmt.PropertyID) {
            return nil, ErrForbidden
        }
        return stmt, nil
    default:
        return nil, ErrForbidden
    }
}
```

**Access matrix by role:**

| Resource | admin | cleaner | cleaning_client | pm_owner | renovation_client | subtrade | bookkeeper |
|---|---|---|---|---|---|---|---|
| properties | RW | R (assigned) | R (own) | R (own) | — | — | R |
| bookings | RW | R (assigned job) | RW (own) | R (own) | — | — | R |
| cleaning_jobs | RW | RW (assigned) | R (own) | — | — | — | R |
| owner_statements | RW | — | — | R (own) | — | — | R |
| projects | RW | — | — | — | R (own) | R (assigned) | R |
| estimates | RW | — | — | — | R (own) | — | R |
| change_orders | RW | — | — | — | RW (own) | RW (assigned) | R |
| expenses | RW | RW (own) | — | — | — | — | RW |
| contacts | RW | R (self) | R (self) | R (self) | R (self) | R (self) | R |

Full role spec in `03_ROLES_ACCESS.md`.
