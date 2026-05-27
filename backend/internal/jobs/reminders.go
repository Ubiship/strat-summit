package jobs

import (
	"context"
	"fmt"
	"time"
)

// SendJobReminders sends reminder notifications to staff for upcoming cleaning jobs.
// It runs every 15 minutes and checks for jobs approximately 2 hours away.
func (s *Scheduler) SendJobReminders() error {
	ctx := context.Background()

	// Get all jobs for today
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)
	jobs, err := s.repo.ListCleaningJobsByDate(ctx, today)
	if err != nil {
		return fmt.Errorf("listing jobs: %w", err)
	}

	for _, job := range jobs {
		// Skip if already reminded
		if job.ReminderSentAt != nil {
			continue
		}

		// Skip completed or flagged jobs
		if job.Status == "complete" || job.Status == "flagged" {
			continue
		}

		// Parse scheduled time or default to 10am
		var jobTime time.Time
		if job.ScheduledTime != nil {
			// Try to parse scheduled time (expected format: "10:00" or "10:00:00")
			parsedTime, err := time.Parse("15:04", *job.ScheduledTime)
			if err != nil {
				parsedTime, err = time.Parse("15:04:05", *job.ScheduledTime)
				if err != nil {
					// Fall back to 10am
					jobTime = time.Date(
						job.ScheduledDate.Year(),
						job.ScheduledDate.Month(),
						job.ScheduledDate.Day(),
						10, 0, 0, 0,
						time.Local,
					)
				} else {
					jobTime = time.Date(
						job.ScheduledDate.Year(),
						job.ScheduledDate.Month(),
						job.ScheduledDate.Day(),
						parsedTime.Hour(), parsedTime.Minute(), 0, 0,
						time.Local,
					)
				}
			} else {
				jobTime = time.Date(
					job.ScheduledDate.Year(),
					job.ScheduledDate.Month(),
					job.ScheduledDate.Day(),
					parsedTime.Hour(), parsedTime.Minute(), 0, 0,
					time.Local,
				)
			}
		} else {
			// Default 10am start time
			jobTime = time.Date(
				job.ScheduledDate.Year(),
				job.ScheduledDate.Month(),
				job.ScheduledDate.Day(),
				10, 0, 0, 0,
				time.Local,
			)
		}

		// Only remind for jobs 1h45m to 2h15m away (around 2 hours before)
		// This window ensures we catch jobs within our 15-minute polling interval
		timeTillJob := time.Until(jobTime)
		if timeTillJob < 105*time.Minute || timeTillJob > 135*time.Minute {
			continue
		}

		// Get property and staff
		property, err := s.repo.GetPropertyByID(ctx, job.PropertyID)
		if err != nil {
			s.logger.Error("getting property for reminder", "jobId", job.ID, "error", err)
			continue
		}

		staff, err := s.repo.GetStaffForJob(ctx, job.ID)
		if err != nil {
			s.logger.Error("getting staff for reminder", "jobId", job.ID, "error", err)
			continue
		}

		if len(staff) == 0 {
			s.logger.Debug("no staff assigned to job", "jobId", job.ID)
			continue
		}

		// Send reminder to each staff member
		for _, contact := range staff {
			if err := s.svc.NotifyJobReminder(ctx, job, contact, property); err != nil {
				s.logger.Error("sending job reminder", "jobId", job.ID, "staffId", contact.ID, "error", err)
			} else {
				s.logger.Debug("sent job reminder", "jobId", job.ID, "staffId", contact.ID)
			}
		}

		// Mark reminder sent
		if err := s.repo.MarkReminderSent(ctx, job.ID); err != nil {
			s.logger.Error("marking reminder sent", "jobId", job.ID, "error", err)
		}

		s.logger.Info("job reminder sent", "jobId", job.ID, "staffCount", len(staff))
	}

	return nil
}
