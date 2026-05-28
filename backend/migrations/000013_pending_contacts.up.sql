-- Pending Contacts for admin review
CREATE TABLE pending_contacts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatwoot_contact_id BIGINT NOT NULL,
    name                TEXT NOT NULL,
    email               TEXT,
    phone               TEXT,
    source              TEXT NOT NULL DEFAULT 'chatwoot',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    action              TEXT, -- 'approved', 'rejected', 'merged'
    merged_with_id      UUID REFERENCES contacts(id) ON DELETE SET NULL
);

-- Index for unreviewed contacts
CREATE INDEX idx_pending_contacts_unreviewed ON pending_contacts(reviewed_at) WHERE reviewed_at IS NULL;

-- Index for Chatwoot contact lookup
CREATE INDEX idx_pending_contacts_chatwoot_id ON pending_contacts(chatwoot_contact_id);
