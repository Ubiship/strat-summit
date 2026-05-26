-- AI Domain Tables

-- vapi_calls: VAPI voice AI call logs
CREATE TABLE vapi_calls (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vapi_call_id   text UNIQUE NOT NULL,
    caller_number  text,
    direction      text NOT NULL DEFAULT 'inbound',
    started_at     timestamptz,
    ended_at       timestamptz,
    duration_sec   int,
    transcript     text,
    summary        text,
    outcome        text,
    booking_id     uuid REFERENCES bookings(id) ON DELETE SET NULL,
    contact_id     uuid REFERENCES contacts(id) ON DELETE SET NULL,
    property_id    uuid REFERENCES properties(id) ON DELETE SET NULL,
    transferred_to text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ai_reports: Generated weekly/monthly reports
CREATE TABLE ai_reports (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type              text NOT NULL,
    period_start      date,
    period_end        date,
    generated_at      timestamptz,
    content_md        text,
    sent_to           text[],
    sent_at           timestamptz,
    resend_message_id text,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Indexes for AI domain
CREATE INDEX idx_vapi_calls_call_id ON vapi_calls(vapi_call_id);
CREATE INDEX idx_vapi_calls_contact ON vapi_calls(contact_id);
CREATE INDEX idx_vapi_calls_property ON vapi_calls(property_id);
CREATE INDEX idx_vapi_calls_booking ON vapi_calls(booking_id);
CREATE INDEX idx_ai_reports_type ON ai_reports(type);
CREATE INDEX idx_ai_reports_period ON ai_reports(period_start, period_end);
