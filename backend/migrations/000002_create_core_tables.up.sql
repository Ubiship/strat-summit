-- Core / Shared Tables: contacts, users
-- Foundation for all other domains

-- contacts: All people in the system (staff, owners, clients, subtrades)
CREATE TABLE contacts (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name          text NOT NULL,
    last_name           text NOT NULL,
    email               text UNIQUE,
    phone               text,
    company_name        text,
    role                user_role NOT NULL,
    notes               text,
    chatwoot_contact_id bigint UNIQUE,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- users: Login accounts (no self-signup, provisioned by admin)
CREATE TABLE users (
    id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id               uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    email                    text UNIQUE NOT NULL,
    password_hash            text NOT NULL,
    role                     user_role NOT NULL,
    refresh_token_hash       text,
    refresh_token_expires_at timestamptz,
    last_login_at            timestamptz,
    active                   boolean NOT NULL DEFAULT true,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

-- Index for user lookups
CREATE INDEX idx_users_contact_id ON users(contact_id);
CREATE INDEX idx_users_active ON users(active) WHERE active = true;
