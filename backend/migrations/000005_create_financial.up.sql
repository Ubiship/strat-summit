-- Financial / QBO Tables

-- expenses: Receipt-captured expenses pending QBO push
CREATE TABLE expenses (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by   uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    property_id    uuid REFERENCES properties(id) ON DELETE SET NULL,
    project_id     uuid REFERENCES projects(id) ON DELETE SET NULL,
    date           date NOT NULL,
    vendor         text,
    description    text,
    amount         numeric(10,2) NOT NULL,
    gst            numeric(10,2) NOT NULL DEFAULT 0,
    pst            numeric(10,2) NOT NULL DEFAULT 0,
    qbo_category   text,
    receipt_key    text,
    ai_confidence  numeric(3,2),
    status         text NOT NULL DEFAULT 'pending',
    qbo_expense_id text,
    pushed_at      timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes for expenses
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by);
CREATE INDEX idx_expenses_property ON expenses(property_id);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
