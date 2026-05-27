-- 000011_fix_constraints.up.sql
-- Fix issues from code review

-- Add UNIQUE constraint on bookings.external_uid for iCal deduplication
ALTER TABLE bookings ADD CONSTRAINT bookings_external_uid_unique UNIQUE (external_uid);

-- Make hot_tub_photo_required NOT NULL with default (update existing NULLs first)
UPDATE cleaning_jobs SET hot_tub_photo_required = false WHERE hot_tub_photo_required IS NULL;
ALTER TABLE cleaning_jobs ALTER COLUMN hot_tub_photo_required SET NOT NULL;
ALTER TABLE cleaning_jobs ALTER COLUMN hot_tub_photo_required SET DEFAULT false;
