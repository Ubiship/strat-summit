CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('customer', 'staff')),
  email text,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  starting_price_cents integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users (id),
  service_id uuid NOT NULL REFERENCES services (id),
  price_shown_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'declined')),
  address_line1 text NOT NULL CHECK (char_length(address_line1) BETWEEN 1 AND 120),
  address_line2 text CHECK (address_line2 IS NULL OR char_length(address_line2) <= 120),
  city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 80),
  province text NOT NULL,
  postal_code text NOT NULL,
  service_date date NOT NULL,
  time_window text NOT NULL CHECK (time_window IN ('morning', 'afternoon', 'evening')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  staff_note text CHECK (staff_note IS NULL OR char_length(staff_note) <= 500),
  decided_by uuid REFERENCES users (id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bookings_customer_created_idx ON bookings (customer_id, created_at DESC);
CREATE INDEX bookings_status_created_idx ON bookings (status, created_at DESC);

INSERT INTO services (id, slug, name, description, starting_price_cents, active, sort_order)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'standard',
    'Standard clean',
    'A regular whole-home clean: kitchens, bathrooms, floors, and surfaces.',
    14900,
    true,
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'deep',
    'Deep clean',
    'A detailed clean that includes inside appliances, baseboards, and built-up grime.',
    24900,
    true,
    2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'move-out',
    'Move-out clean',
    'An empty-home clean for a move-out or handover.',
    32900,
    true,
    3
  );
