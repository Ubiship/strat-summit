-- Laundromat Domain (Stub - P3)

-- laundromat_locations: Laundromat locations
CREATE TABLE laundromat_locations (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text,
    address    text,
    active     boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- laundromat_machines: Machines at each location
CREATE TABLE laundromat_machines (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id    uuid NOT NULL REFERENCES laundromat_locations(id) ON DELETE CASCADE,
    type           text NOT NULL,  -- 'washer' or 'dryer'
    machine_number text,
    active         boolean NOT NULL DEFAULT true,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes for laundromat
CREATE INDEX idx_laundromat_machines_location ON laundromat_machines(location_id);
