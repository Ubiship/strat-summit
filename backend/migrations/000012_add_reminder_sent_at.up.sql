-- Add reminder_sent_at column to cleaning_jobs for tracking job reminders
ALTER TABLE cleaning_jobs ADD COLUMN reminder_sent_at TIMESTAMPTZ;

-- Add index for efficient querying of jobs that haven't been reminded yet
CREATE INDEX idx_cleaning_jobs_reminder_sent_at ON cleaning_jobs (scheduled_date) WHERE reminder_sent_at IS NULL;

COMMENT ON COLUMN cleaning_jobs.reminder_sent_at IS 'Timestamp when the reminder notification was sent to assigned staff';
