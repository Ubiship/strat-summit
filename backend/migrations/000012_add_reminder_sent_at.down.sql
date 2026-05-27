-- Remove reminder_sent_at column from cleaning_jobs
DROP INDEX IF EXISTS idx_cleaning_jobs_reminder_sent_at;
ALTER TABLE cleaning_jobs DROP COLUMN IF EXISTS reminder_sent_at;
