-- Renovations Domain Tables

-- subtrades: Subcontractors (electricians, plumbers, etc.)
CREATE TABLE subtrades (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id           uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    trade_type           text NOT NULL,
    insurance_provider   text,
    insurance_policy_num text,
    insurance_expiry     date,
    default_rate         numeric(10,2),
    notes                text,
    active               boolean NOT NULL DEFAULT true,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now()
);

-- projects: Renovation projects
CREATE TABLE projects (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id               uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    name                     text NOT NULL,
    address                  text,
    status                   project_status NOT NULL DEFAULT 'estimate',
    billing_model            billing_model NOT NULL,
    description              text,
    start_date               date,
    estimated_end_date       date,
    actual_end_date          date,
    deposit_pct              numeric(5,4) DEFAULT 0.50,
    deposit_amount           numeric(10,2),
    deposit_paid_at          date,
    total_estimate           numeric(10,2),
    total_invoiced           numeric(10,2),
    total_paid               numeric(10,2),
    margin_target_pct        numeric(5,4),
    notes                    text,
    chatwoot_conversation_id bigint,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- Add FK from photos to projects
ALTER TABLE photos ADD CONSTRAINT fk_photos_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- estimates: Project cost estimates
CREATE TABLE estimates (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id         uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version            int NOT NULL DEFAULT 1,
    status             text NOT NULL DEFAULT 'draft',
    valid_until        date,
    subtotal_materials numeric(10,2),
    subtotal_labour    numeric(10,2),
    margin_amount      numeric(10,2),
    gst                numeric(10,2),
    total              numeric(10,2),
    notes              text,
    internal_notes     text,
    dropbox_sign_id    text,
    signed_at          timestamptz,
    qbo_estimate_id    text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- estimate_line_items: Line items on estimates
CREATE TABLE estimate_line_items (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id  uuid NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    type         text NOT NULL,  -- 'material' or 'labour'
    description  text NOT NULL,
    quantity     numeric(8,2) NOT NULL,
    unit         text,
    unit_cost    numeric(10,2) NOT NULL,
    margin_pct   numeric(5,4) NOT NULL DEFAULT 0,
    subtotal     numeric(10,2) GENERATED ALWAYS AS (quantity * unit_cost * (1 + margin_pct)) STORED,
    supplier     text,
    notes        text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

-- contracts: Signed renovation contracts
CREATE TABLE contracts (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    estimate_id     uuid NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
    type            agreement_type NOT NULL,
    status          text NOT NULL DEFAULT 'pending',
    dropbox_sign_id text,
    signed_at       timestamptz,
    document_key    text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- change_orders: Contract modifications
CREATE TABLE change_orders (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contract_id     uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    version         int NOT NULL,
    description     text NOT NULL,
    delta_materials numeric(10,2) NOT NULL DEFAULT 0,
    delta_labour    numeric(10,2) NOT NULL DEFAULT 0,
    delta_total     numeric(10,2) GENERATED ALWAYS AS (delta_materials + delta_labour) STORED,
    status          change_order_status NOT NULL DEFAULT 'pending',
    dropbox_sign_id text,
    signed_at       timestamptz,
    document_key    text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- project_milestones: Payment milestones for projects
CREATE TABLE project_milestones (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name          text NOT NULL,
    description   text,
    pct_of_total  numeric(5,4),
    fixed_amount  numeric(10,2),
    due_date      date,
    completed_at  timestamptz,
    invoice_id    text,
    invoiced_at   timestamptz,
    paid_at       timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- project_subtrades: Junction for subtrades assigned to projects
CREATE TABLE project_subtrades (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    subtrade_id  uuid NOT NULL REFERENCES subtrades(id) ON DELETE CASCADE,
    phase        text,
    agreed_rate  numeric(10,2),
    notes        text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE(project_id, subtrade_id)
);

-- Indexes for renovations domain
CREATE INDEX idx_subtrades_contact ON subtrades(contact_id);
CREATE INDEX idx_subtrades_active ON subtrades(active) WHERE active = true;
CREATE INDEX idx_projects_contact_id ON projects(contact_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_estimates_project ON estimates(project_id);
CREATE INDEX idx_estimate_line_items_estimate ON estimate_line_items(estimate_id);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_change_orders_project ON change_orders(project_id);
CREATE INDEX idx_project_milestones_project ON project_milestones(project_id);
CREATE INDEX idx_project_subtrades_project ON project_subtrades(project_id);
CREATE INDEX idx_photos_project ON photos(project_id);
