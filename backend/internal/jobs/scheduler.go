package jobs

import (
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
func (s *Scheduler) Start() {
	// Job reminders - every 15 minutes
	_, err := s.cron.AddFunc("*/15 * * * *", func() {
		s.logger.Info("running job reminders")
		if err := s.SendJobReminders(); err != nil {
			s.logger.Error("job reminders failed", "error", err)
		}
	})
	if err != nil {
		s.logger.Error("failed to add job reminders cron", "error", err)
	}

	// Weekly report - Monday 7am Pacific
	_, err = s.cron.AddFunc("0 7 * * 1", func() {
		s.logger.Info("running weekly report")
		if err := s.SendWeeklyReport(); err != nil {
			s.logger.Error("weekly report failed", "error", err)
		}
	})
	if err != nil {
		s.logger.Error("failed to add weekly report cron", "error", err)
	}

	// Monthly report - 1st of month 7am Pacific
	_, err = s.cron.AddFunc("0 7 1 * *", func() {
		s.logger.Info("running monthly report")
		if err := s.SendMonthlyReport(); err != nil {
			s.logger.Error("monthly report failed", "error", err)
		}
	})
	if err != nil {
		s.logger.Error("failed to add monthly report cron", "error", err)
	}

	s.cron.Start()
	s.logger.Info("cron scheduler started")
}

// Stop gracefully shuts down the scheduler.
func (s *Scheduler) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	s.logger.Info("cron scheduler stopped")
}
