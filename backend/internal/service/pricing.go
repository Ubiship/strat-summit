package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// CalculateCancellationFeeFromHours calculates the cancellation fee based on notice hours and turnover rate.
// Fee brackets per spec section 5.1:
// - 7+ days (168+ hours): No fee
// - 48 hours to 7 days: $55 flat fee
// - 24-48 hours: 50% of turnover rate
// - Under 24 hours: 100% of turnover rate
func CalculateCancellationFeeFromHours(hoursNotice, turnoverRate float64) float64 {
	switch {
	case hoursNotice >= 168: // 7+ days
		return 0
	case hoursNotice >= 48: // 48 hours to 7 days
		return 55.00
	case hoursNotice >= 24: // 24-48 hours
		return turnoverRate * 0.5
	default: // Under 24 hours
		return turnoverRate
	}
}

// CalculateCancellationFee calculates the cancellation fee for a cleaning job.
// It fetches the job and property, determines the turnover rate, and applies the fee brackets.
func (s *Service) CalculateCancellationFee(ctx context.Context, jobID uuid.UUID, cancelledAt time.Time) (float64, error) {
	job, err := s.repo.GetCleaningJobByID(ctx, jobID)
	if err != nil {
		return 0, fmt.Errorf("getting cleaning job: %w", err)
	}

	property, err := s.repo.GetPropertyByID(ctx, job.PropertyID)
	if err != nil {
		return 0, fmt.Errorf("getting property: %w", err)
	}

	// Get the turnover rate for the scheduled date
	turnoverRate, err := property.GetTurnoverRate(job.ScheduledDate)
	if err != nil {
		return 0, fmt.Errorf("getting turnover rate: %w", err)
	}

	// Calculate hours of notice
	scheduledTime := time.Date(
		job.ScheduledDate.Year(), job.ScheduledDate.Month(), job.ScheduledDate.Day(),
		11, 0, 0, 0, job.ScheduledDate.Location(), // Default 11am scheduled time
	)
	if job.ScheduledTime != nil && *job.ScheduledTime != "" {
		// Parse scheduled time if available
		parsed, err := time.Parse("15:04", *job.ScheduledTime)
		if err == nil {
			scheduledTime = time.Date(
				job.ScheduledDate.Year(), job.ScheduledDate.Month(), job.ScheduledDate.Day(),
				parsed.Hour(), parsed.Minute(), 0, 0, job.ScheduledDate.Location(),
			)
		}
	}

	hoursNotice := scheduledTime.Sub(cancelledAt).Hours()
	if hoursNotice < 0 {
		hoursNotice = 0
	}

	return CalculateCancellationFeeFromHours(hoursNotice, turnoverRate), nil
}

// CancelCleaningJob cancels a cleaning job and calculates the cancellation fee.
func (s *Service) CancelCleaningJob(ctx context.Context, auth *domain.AuthContext, jobID uuid.UUID, reason string) (*domain.CleaningJob, error) {
	// Only admin can cancel jobs
	if auth.Role != domain.RoleAdmin {
		return nil, ErrForbidden
	}

	cancelledAt := time.Now()

	// Calculate fee
	fee, err := s.CalculateCancellationFee(ctx, jobID, cancelledAt)
	if err != nil {
		return nil, fmt.Errorf("calculating cancellation fee: %w", err)
	}

	// Update the job
	job, err := s.repo.GetCleaningJobByID(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("getting cleaning job: %w", err)
	}

	job.Status = domain.JobStatusCancelled
	job.CancelledAt = &cancelledAt
	job.CancellationFee = &fee
	job.CancellationReason = &reason

	if err := s.repo.UpdateCleaningJobCancellation(ctx, job); err != nil {
		return nil, fmt.Errorf("updating cleaning job: %w", err)
	}

	return job, nil
}
