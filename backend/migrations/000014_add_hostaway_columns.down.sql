DROP INDEX IF EXISTS idx_bookings_external_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS external_id;

DROP INDEX IF EXISTS idx_properties_hostaway_id;
ALTER TABLE properties DROP COLUMN IF EXISTS hostaway_id;
