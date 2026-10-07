-- Create linen_type enum
CREATE TYPE linen_type AS ENUM (
    'sheet_set',
    'duvet_cover',
    'duvet_insert',
    'mattress_pad',
    'pillow',
    'pillow_protector',
    'body_towel',
    'hand_towel',
    'bath_mat',
    'kitchen_towel'
);

-- Create bed_size enum
CREATE TYPE bed_size AS ENUM ('twin', 'double', 'queen', 'king', 'sofa_bed');

-- Create property linens table
CREATE TABLE property_linens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    linen_type linen_type NOT NULL,
    bed_size bed_size,
    location TEXT,
    quantity INT NOT NULL DEFAULT 1,
    required_sets INT NOT NULL DEFAULT 3,
    condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'needs_replacement')),
    last_deep_clean DATE,
    turnovers_since_launder INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_property_linens_updated_at
    BEFORE UPDATE ON property_linens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create linen rotation log table
CREATE TABLE linen_rotation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_linen_id UUID NOT NULL REFERENCES property_linens(id) ON DELETE CASCADE,
    job_id UUID REFERENCES cleaning_jobs(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('laundered', 'rotated', 'replaced')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_property_linens_property_id ON property_linens(property_id);
CREATE INDEX idx_property_linens_linen_type ON property_linens(linen_type);
CREATE INDEX idx_linen_rotation_log_property_linen_id ON linen_rotation_log(property_linen_id);
CREATE INDEX idx_linen_rotation_log_job_id ON linen_rotation_log(job_id);
