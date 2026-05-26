package jobs

import (
	"context"
	"log/slog"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/service"
)

type Jobs struct {
	svc    *service.Service
	logger *slog.Logger
}

func New(svc *service.Service, logger *slog.Logger) *Jobs {
	return &Jobs{
		svc:    svc,
		logger: logger,
	}
}

// Start begins all background job schedules
func (j *Jobs) Start(ctx context.Context) {
	go j.runICalSync(ctx)
	go j.runStatementGeneration(ctx)
}

// runICalSync polls Airbnb/VRBO iCal feeds every 15 minutes
func (j *Jobs) runICalSync(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			j.logger.Info("running iCal sync")
			// TODO: implement
		}
	}
}

// runStatementGeneration generates owner statements on the 1st of each month
func (j *Jobs) runStatementGeneration(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			now := time.Now()
			if now.Day() == 1 && now.Hour() == 9 {
				j.logger.Info("running statement generation")
				// TODO: implement
			}
		}
	}
}
