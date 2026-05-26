-- Chatwoot Sync Tables

-- chatwoot_events: Audit log of Chatwoot webhooks
CREATE TABLE chatwoot_events (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chatwoot_event_type      text NOT NULL,
    chatwoot_conversation_id bigint,
    chatwoot_contact_id      bigint,
    payload                  jsonb NOT NULL,
    processed                boolean NOT NULL DEFAULT false,
    processed_at             timestamptz,
    error                    text,
    contact_id               uuid REFERENCES contacts(id) ON DELETE SET NULL,
    booking_id               uuid REFERENCES bookings(id) ON DELETE SET NULL,
    project_id               uuid REFERENCES projects(id) ON DELETE SET NULL,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- Indexes for Chatwoot sync
CREATE INDEX idx_contacts_chatwoot_id ON contacts(chatwoot_contact_id);
CREATE INDEX idx_chatwoot_events_processed ON chatwoot_events(processed) WHERE processed = false;
CREATE INDEX idx_chatwoot_events_conversation ON chatwoot_events(chatwoot_conversation_id);
CREATE INDEX idx_chatwoot_events_contact ON chatwoot_events(chatwoot_contact_id);
CREATE INDEX idx_chatwoot_events_type ON chatwoot_events(chatwoot_event_type);
