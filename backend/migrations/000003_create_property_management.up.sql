-- Property Management Domain Tables

-- checklist_templates: Cleaning checklist definitions
CREATE TABLE checklist_templates (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    rooms      jsonb NOT NULL,
    version    int NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- properties: Vacation rental properties
CREATE TABLE properties (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        text NOT NULL,
    address                     text NOT NULL,
    tier                        service_tier NOT NULL,
    commission_rate             numeric(5,4) NOT NULL DEFAULT 0.20,
    cleaning_fee                numeric(10,2) NOT NULL DEFAULT 300.00,
    cleaning_fee_commissionable boolean NOT NULL DEFAULT false,
    airbnb_ical_url             text,
    vrbo_ical_url               text,
    wifi_password               text,
    access_codes                jsonb,
    hot_tub                     boolean NOT NULL DEFAULT false,
    hot_tub_temp_f              int DEFAULT 104,
    notes                       text,
    supply_list                 jsonb,
    checklist_template_id       uuid REFERENCES checklist_templates(id),
    active                      boolean NOT NULL DEFAULT true,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- property_owners: Junction for co-ownership support
CREATE TABLE property_owners (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id     uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    equity_share    numeric(5,4) NOT NULL DEFAULT 1.0,
    portal_access   boolean NOT NULL DEFAULT false,
    statement_email text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE(property_id, contact_id)
);

-- service_agreements: Service tier contracts
CREATE TABLE service_agreements (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id      uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    contact_id       uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tier             service_tier NOT NULL,
    type             agreement_type NOT NULL,
    monthly_rate     numeric(10,2),
    commission_rate  numeric(5,4),
    effective_date   date NOT NULL,
    expiry_date      date,
    dropbox_sign_id  text,
    signed_at        timestamptz,
    document_key     text,
    status           text NOT NULL DEFAULT 'pending',
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

-- owner_statements: Monthly payout statements (Tier 3)
CREATE TABLE owner_statements (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id              uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    property_owner_id        uuid NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
    period_start             date NOT NULL,
    period_end               date NOT NULL,
    total_revenue_incl_fee   numeric(10,2),
    total_revenue_excl_fee   numeric(10,2),
    commission_rate          numeric(5,4),
    commission_total         numeric(10,2),
    gst_collected            numeric(10,2),
    pst_collected            numeric(10,2),
    mrdt_collected           numeric(10,2),
    expenses_cleaning        numeric(10,2),
    expenses_laundry         numeric(10,2),
    expenses_shoveling       numeric(10,2),
    expenses_maintenance     numeric(10,2),
    expenses_purchases       numeric(10,2),
    expenses_total           numeric(10,2),
    owner_payout_net         numeric(10,2),
    status                   statement_status NOT NULL DEFAULT 'draft',
    pdf_key                  text,
    sent_at                  timestamptz,
    qbo_invoice_id           text,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- cleaning_jobs: Cleaning assignments
CREATE TABLE cleaning_jobs (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id              uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id               uuid,  -- FK added after bookings table
    scheduled_date           date NOT NULL,
    scheduled_time           time,
    status                   job_status NOT NULL DEFAULT 'assigned',
    comp_model               comp_model NOT NULL DEFAULT 'hourly',
    job_rate                 numeric(10,2),
    duration_hours           numeric(5,2),
    arrived_at               timestamptz,
    completed_at             timestamptz,
    checklist_data           jsonb,
    checklist_completion_pct int GENERATED ALWAYS AS (
        CASE
            WHEN checklist_data IS NULL THEN 0
            WHEN jsonb_typeof(checklist_data) != 'object' THEN 0
            ELSE COALESCE((checklist_data->>'completion_pct')::int, 0)
        END
    ) STORED,
    hot_tub_photo_required   boolean,
    hot_tub_status           text,
    damage_notes             text,
    restock_notes            text,
    internal_notes           text,
    dispatched_at            timestamptz,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- bookings: Guest reservations
CREATE TABLE bookings (
    id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id               uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    source                    booking_source NOT NULL,
    tax_treatment             tax_treatment NOT NULL,
    external_uid              text,
    guest_name                text,
    guest_email               text,
    guest_phone               text,
    check_in                  date NOT NULL,
    check_out                 date NOT NULL,
    nights                    int GENERATED ALWAYS AS (check_out - check_in) STORED,
    nightly_rate              numeric(10,2),
    nightly_rate_weekend      numeric(10,2),
    nightly_rate_holiday      numeric(10,2),
    revenue_incl_cleaning_fee numeric(10,2),
    revenue_excl_cleaning_fee numeric(10,2),
    cleaning_fee_charged      numeric(10,2),
    gst                       numeric(10,2) NOT NULL DEFAULT 0,
    pst                       numeric(10,2) NOT NULL DEFAULT 0,
    mrdt                      numeric(10,2) NOT NULL DEFAULT 0,
    notes                     text,
    cleaning_job_id           uuid REFERENCES cleaning_jobs(id),
    statement_id              uuid REFERENCES owner_statements(id),
    chatwoot_conversation_id  bigint,
    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now()
);

-- Add FK from cleaning_jobs to bookings
ALTER TABLE cleaning_jobs ADD CONSTRAINT fk_cleaning_jobs_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- cleaning_job_staff: Many-to-many cleaners per job
CREATE TABLE cleaning_job_staff (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      uuid NOT NULL REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    contact_id  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    hours_logged numeric(5,2),
    hourly_rate  numeric(10,2),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE(job_id, contact_id)
);

-- service_lines: Line items on internal breakdown (attached to booking or standalone)
CREATE TABLE service_lines (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id   uuid REFERENCES bookings(id) ON DELETE SET NULL,
    statement_id uuid REFERENCES owner_statements(id) ON DELETE SET NULL,
    type         service_line_type NOT NULL,
    date         date NOT NULL,
    description  text,
    quantity     numeric(8,2) NOT NULL,
    rate         numeric(10,2) NOT NULL,
    markup_rate  numeric(5,4) NOT NULL DEFAULT 0,
    subtotal     numeric(10,2) GENERATED ALWAYS AS (quantity * rate * (1 + markup_rate)) STORED,
    tax_type     tax_type NOT NULL,
    gst          numeric(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN tax_type IN ('gst_only', 'gst_pst', 'gst_pst_mrdt')
            THEN ROUND(quantity * rate * (1 + markup_rate) * 0.05, 2)
            ELSE 0
        END
    ) STORED,
    pst          numeric(10,2) GENERATED ALWAYS AS (
        CASE
            WHEN tax_type IN ('gst_pst', 'gst_pst_mrdt')
            THEN ROUND(quantity * rate * (1 + markup_rate) * 0.07, 2)
            ELSE 0
        END
    ) STORED,
    total        numeric(10,2) GENERATED ALWAYS AS (
        quantity * rate * (1 + markup_rate) * (
            1 + CASE
                WHEN tax_type = 'none' THEN 0
                WHEN tax_type = 'gst_only' THEN 0.05
                WHEN tax_type IN ('gst_pst', 'gst_pst_mrdt') THEN 0.12
                ELSE 0
            END
        )
    ) STORED,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- photos: Job and project photos stored in MinIO
CREATE TABLE photos (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       uuid REFERENCES cleaning_jobs(id) ON DELETE CASCADE,
    project_id   uuid,  -- FK added in renovations migration
    uploaded_by  uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    bucket       text NOT NULL,
    storage_key  text NOT NULL,
    content_type text NOT NULL DEFAULT 'image/jpeg',
    size_bytes   bigint,
    visibility   photo_visibility NOT NULL DEFAULT 'internal',
    room         text,
    caption      text,
    taken_at     timestamptz,
    is_required  boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Indexes for property management domain
CREATE INDEX idx_properties_active ON properties(active) WHERE active = true;
CREATE INDEX idx_property_owners_property ON property_owners(property_id);
CREATE INDEX idx_property_owners_contact ON property_owners(contact_id);
CREATE INDEX idx_service_agreements_property ON service_agreements(property_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_external_uid ON bookings(external_uid);
CREATE INDEX idx_cleaning_jobs_property_id ON cleaning_jobs(property_id);
CREATE INDEX idx_cleaning_jobs_scheduled_date ON cleaning_jobs(scheduled_date);
CREATE INDEX idx_cleaning_jobs_status ON cleaning_jobs(status);
CREATE INDEX idx_cleaning_jobs_booking ON cleaning_jobs(booking_id);
CREATE INDEX idx_owner_statements_property_id ON owner_statements(property_id);
CREATE INDEX idx_owner_statements_period ON owner_statements(period_start, period_end);
CREATE INDEX idx_service_lines_booking_id ON service_lines(booking_id);
CREATE INDEX idx_service_lines_statement_id ON service_lines(statement_id);
CREATE INDEX idx_photos_job ON photos(job_id);
