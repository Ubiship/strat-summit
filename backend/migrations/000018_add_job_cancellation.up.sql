-- Add cancellation fields to cleaning_jobs
ALTER TABLE cleaning_jobs ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_fee NUMERIC(10,2);
ALTER TABLE cleaning_jobs ADD COLUMN cancellation_reason TEXT;

-- Add cancelled status to job_status enum
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'cancelled';
