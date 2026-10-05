CREATE TABLE newsletter_subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMPTZ,
    source TEXT DEFAULT 'website'
);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
