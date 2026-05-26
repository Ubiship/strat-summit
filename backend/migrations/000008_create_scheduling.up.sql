-- Scheduling Domain (Cal.com integration)

-- consultations: Booked consultation appointments
CREATE TABLE consultations (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id               uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    project_id               uuid REFERENCES projects(id) ON DELETE SET NULL,
    cal_booking_uid          text UNIQUE NOT NULL,
    event_type               text NOT NULL,
    start_time               timestamptz NOT NULL,
    end_time                 timestamptz NOT NULL,
    status                   text NOT NULL DEFAULT 'confirmed',
    notes                    text,
    chatwoot_conversation_id bigint,
    outcome                  text,
    project_created          boolean NOT NULL DEFAULT false,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- Indexes for scheduling
CREATE INDEX idx_consultations_contact ON consultations(contact_id);
CREATE INDEX idx_consultations_project ON consultations(project_id);
CREATE INDEX idx_consultations_cal_uid ON consultations(cal_booking_uid);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_start_time ON consultations(start_time);
