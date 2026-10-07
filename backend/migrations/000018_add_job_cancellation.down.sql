-- Remove cancellation fields from cleaning_jobs
ALTER TABLE cleaning_jobs DROP COLUMN cancellation_reason;
ALTER TABLE cleaning_jobs DROP COLUMN cancellation_fee;
ALTER TABLE cleaning_jobs DROP COLUMN cancelled_at;
-- Note: Cannot remove enum values in PostgreSQL
