package jobs

import (
	"fmt"
	"log/slog"

	"github.com/robfig/cron/v3"
	"github.com/ubiship/strat-summit/backend/internal/repository"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

// Scheduler manages cron-based background jobs for notifications and reports.
type Scheduler struct {
	cron   *cron.Cron
	repo   *repository.Repository
	svc    *service.Service
	logger *slog.Logger
}

// NewScheduler creates a new Scheduler instance.
func NewScheduler(repo *repository.Repository, svc *service.Service, logger *slog.Logger) *Scheduler {
	return &Scheduler{
		cron:   cron.New(),
		repo:   repo,
		svc:    svc,
		logger: logger,
	}
}

// Start begins all scheduled cron jobs.
// Returns an error if any cron job registration fails.
func (s *Scheduler) Start() error {
	// Job reminders - every 15 minutes
	_, err := s.cron.AddFunc("*/15 * * * *", func() {
		s.logger.Info("running job reminders")
		if err := s.SendJobReminders(); err != nil {
			s.logger.Error("job reminders failed", "error", err)
		}
	})
	if err != nil {
		return fmt.Errorf("adding job reminders cron: %w", err)
	}

	// Weekly report - Monday 7:00 UTC
	_, err = s.cron.AddFunc("0 7 * * 1", func() {
		s.logger.Info("running weekly report")
		if err := s.SendWeeklyReport(); err != nil {
			s.logger.Error("weekly report failed", "error", err)
		}
	})
	if err != nil {
		return fmt.Errorf("adding weekly report cron: %w", err)
	}

	// Monthly report - 1st of month 7:00 UTC
	_, err = s.cron.AddFunc("0 7 1 * *", func() {
		s.logger.Info("running monthly report")
		if err := s.SendMonthlyReport(); err != nil {
			s.logger.Error("monthly report failed", "error", err)
		}
	})
	if err != nil {
		return fmt.Errorf("adding monthly report cron: %w", err)
	}

	s.cron.Start()
	s.logger.Info("cron scheduler started")
	return nil
}

// Stop gracefully shuts down the scheduler.
func (s *Scheduler) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	s.logger.Info("cron scheduler stopped")
}
