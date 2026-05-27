package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/service"
)

// SendWeeklyReport sends a weekly summary report to all admins.
func (s *Scheduler) SendWeeklyReport() error {
	ctx := context.Background()

	// Calculate period (last 7 days)
	now := time.Now()
	periodStart := now.AddDate(0, 0, -7)
	periodEnd := now

	// Get admins
	admins, err := s.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
	if err != nil {
		return fmt.Errorf("listing admins: %w", err)
	}

	if len(admins) == 0 {
		s.logger.Info("no admins to send weekly report")
		return nil
	}

	// Build stats payload
	stats := map[string]interface{}{
		"reportType":  "weekly",
		"periodStart": periodStart.Format("Jan 2"),
		"periodEnd":   periodEnd.Format("Jan 2"),
		"year":        periodEnd.Year(),
	}

	// Send to each admin
	novuClient := s.svc.Novu()
	if novuClient == nil {
		s.logger.Warn("novu not configured, skipping weekly report")
		return nil
	}

	var sentCount int
	for _, admin := range admins {
		if err := novuClient.Trigger(ctx, service.EventReportWeekly, admin.ID.String(), stats); err != nil {
			s.logger.Error("sending weekly report", "adminId", admin.ID, "error", err)
		} else {
			sentCount++
		}
	}

	s.logger.Info("weekly report sent", "recipientCount", sentCount)
	return nil
}

// SendMonthlyReport sends a monthly summary report to all admins and bookkeepers.
func (s *Scheduler) SendMonthlyReport() error {
	ctx := context.Background()

	// Calculate period (previous month)
	now := time.Now()
	// Get the first day of current month, then go back one day to get last month
	firstOfCurrentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	lastDayOfPrevMonth := firstOfCurrentMonth.Add(-time.Second)
	firstOfPrevMonth := time.Date(lastDayOfPrevMonth.Year(), lastDayOfPrevMonth.Month(), 1, 0, 0, 0, 0, time.Local)

	periodStart := firstOfPrevMonth
	periodEnd := lastDayOfPrevMonth

	// Get admins
	admins, err := s.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
	if err != nil {
		return fmt.Errorf("listing admins: %w", err)
	}

	// Get bookkeepers
	bookkeepers, err := s.repo.ListContactsByRole(ctx, domain.RoleBookkeeper, domain.ListOptions{Limit: 100})
	if err != nil {
		return fmt.Errorf("listing bookkeepers: %w", err)
	}

	// Combine recipients (deduped by using a map)
	recipientMap := make(map[string]*domain.Contact)
	for _, admin := range admins {
		recipientMap[admin.ID.String()] = admin
	}
	for _, bookkeeper := range bookkeepers {
		recipientMap[bookkeeper.ID.String()] = bookkeeper
	}

	if len(recipientMap) == 0 {
		s.logger.Info("no recipients for monthly report")
		return nil
	}

	// Build stats payload
	stats := map[string]interface{}{
		"reportType":  "monthly",
		"periodStart": periodStart.Format("Jan 2"),
		"periodEnd":   periodEnd.Format("Jan 2"),
		"month":       periodStart.Format("January 2006"),
		"year":        periodStart.Year(),
	}

	// Send to each recipient
	novuClient := s.svc.Novu()
	if novuClient == nil {
		s.logger.Warn("novu not configured, skipping monthly report")
		return nil
	}

	var sentCount int
	for _, recipient := range recipientMap {
		if err := novuClient.Trigger(ctx, service.EventReportMonthly, recipient.ID.String(), stats); err != nil {
			s.logger.Error("sending monthly report", "recipientId", recipient.ID, "error", err)
		} else {
			sentCount++
		}
	}

	s.logger.Info("monthly report sent", "recipientCount", sentCount)
	return nil
}
