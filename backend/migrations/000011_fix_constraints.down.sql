-- 000011_fix_constraints.down.sql
-- Rollback constraint fixes

ALTER TABLE cleaning_jobs ALTER COLUMN hot_tub_photo_required DROP DEFAULT;
ALTER TABLE cleaning_jobs ALTER COLUMN hot_tub_photo_required DROP NOT NULL;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_external_uid_unique;
