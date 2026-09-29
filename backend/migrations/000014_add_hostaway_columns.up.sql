-- Add Hostaway integration columns
ALTER TABLE properties ADD COLUMN hostaway_id TEXT UNIQUE;
CREATE INDEX idx_properties_hostaway_id ON properties(hostaway_id) WHERE hostaway_id IS NOT NULL;

ALTER TABLE bookings ADD COLUMN external_id TEXT UNIQUE;
CREATE INDEX idx_bookings_external_id ON bookings(external_id) WHERE external_id IS NOT NULL;
