package service

import (
	"context"
	"fmt"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/novu"
)

// Notification event constants
const (
	EventJobAssigned           = "job.assigned"
	EventJobReminder           = "job.reminder"
	EventJobCompleted          = "job.completed"
	EventBookingConfirmed      = "booking.confirmed"
	EventBookingDirectNew      = "booking.direct.new"
	EventStatementGenerated    = "statement.generated"
	EventStatementSent         = "statement.sent"
	EventEstimateSent          = "estimate.sent"
	EventEstimateAccepted      = "estimate.accepted"
	EventContractSigned        = "contract.signed"
	EventChangeOrderSubmitted  = "change_order.submitted"
	EventChangeOrderApproved   = "change_order.approved"
	EventChangeOrderRejected   = "change_order.rejected"
	EventPaymentReceived       = "payment.received"
	EventHotTubAlert           = "hot_tub.alert"
	EventReportWeekly          = "report.weekly"
	EventReportMonthly         = "report.monthly"
	EventExpensePending        = "expense.pending"
	EventCalConsultationBooked = "cal.consultation.booked"
)

// getAdminSubscriberIDs returns subscriber IDs for all admin contacts.
func (s *Service) getAdminSubscriberIDs(ctx context.Context) ([]string, error) {
	admins, err := s.repo.ListContactsByRole(ctx, domain.RoleAdmin, domain.ListOptions{Limit: 100})
	if err != nil {
		return nil, fmt.Errorf("listing admin contacts: %w", err)
	}

	subscriberIDs := make([]string, 0, len(admins))
	for _, admin := range admins {
		subscriberIDs = append(subscriberIDs, admin.ID.String())
	}
	return subscriberIDs, nil
}

// NotifyJobAssigned sends a notification to assigned staff when a job is assigned.
func (s *Service) NotifyJobAssigned(ctx context.Context, job *domain.CleaningJob, staff *domain.Contact, property *domain.Property) error {
	if s.novu == nil {
		return nil
	}

	payload := map[string]interface{}{
		"job_id":         job.ID.String(),
		"property_name":  property.Name,
		"property_addr":  property.Address,
		"scheduled_date": job.ScheduledDate.Format("2006-01-02"),
		"staff_name":     staff.FullName(),
	}

	return s.novu.Trigger(ctx, EventJobAssigned, staff.ID.String(), payload)
}

// NotifyJobReminder sends a reminder notification to assigned staff about an upcoming job.
func (s *Service) NotifyJobReminder(ctx context.Context, job *domain.CleaningJob, staff *domain.Contact, property *domain.Property) error {
	if s.novu == nil {
		return nil
	}

	payload := map[string]interface{}{
		"job_id":         job.ID.String(),
		"property_name":  property.Name,
		"property_addr":  property.Address,
		"scheduled_date": job.ScheduledDate.Format("2006-01-02"),
		"scheduled_time": job.ScheduledTime,
		"staff_name":     staff.FullName(),
	}

	return s.novu.Trigger(ctx, EventJobReminder, staff.ID.String(), payload)
}

// NotifyJobCompleted sends a notification to all admins when a job is completed.
func (s *Service) NotifyJobCompleted(ctx context.Context, job *domain.CleaningJob, property *domain.Property) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"job_id":        job.ID.String(),
		"property_name": property.Name,
		"property_addr": property.Address,
		"completed_at":  job.CompletedAt,
	}

	return s.novu.BulkTrigger(ctx, EventJobCompleted, subscriberIDs, payload)
}

// NotifyBookingConfirmed sends a notification to all admins when a booking is confirmed.
func (s *Service) NotifyBookingConfirmed(ctx context.Context, booking *domain.Booking, property *domain.Property) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"booking_id":    booking.ID.String(),
		"property_name": property.Name,
		"source":        string(booking.Source),
		"guest_name":    booking.GuestName,
		"check_in":      booking.CheckIn.Format("2006-01-02"),
		"check_out":     booking.CheckOut.Format("2006-01-02"),
		"nights":        booking.Nights,
	}

	return s.novu.BulkTrigger(ctx, EventBookingConfirmed, subscriberIDs, payload)
}

// NotifyHotTubAlert sends an alert to all admins about a hot tub issue.
func (s *Service) NotifyHotTubAlert(ctx context.Context, property *domain.Property, status string, notes string) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"property_id":   property.ID.String(),
		"property_name": property.Name,
		"property_addr": property.Address,
		"status":        status,
		"notes":         notes,
	}

	return s.novu.BulkTrigger(ctx, EventHotTubAlert, subscriberIDs, payload)
}

// NotifyStatementGenerated sends a notification to all admins when a statement is generated.
func (s *Service) NotifyStatementGenerated(ctx context.Context, property *domain.Property, month time.Time) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"property_id":   property.ID.String(),
		"property_name": property.Name,
		"month":         month.Format("January 2006"),
	}

	return s.novu.BulkTrigger(ctx, EventStatementGenerated, subscriberIDs, payload)
}

// NotifyStatementSent sends a notification to an owner when their statement is sent.
func (s *Service) NotifyStatementSent(
	ctx context.Context,
	owner *domain.Contact,
	property *domain.Property,
	month time.Time,
	grossRevenue float64,
	commission float64,
	payout float64,
	pdfURL string,
) error {
	if s.novu == nil {
		return nil
	}

	payload := map[string]interface{}{
		"owner_name":    owner.FullName(),
		"property_name": property.Name,
		"month":         month.Format("January 2006"),
		"gross_revenue": grossRevenue,
		"commission":    commission,
		"payout":        payout,
		"pdf_url":       pdfURL,
	}

	return s.novu.Trigger(ctx, EventStatementSent, owner.ID.String(), payload)
}

// NotifyEstimateSent sends a notification to a client when an estimate is sent.
func (s *Service) NotifyEstimateSent(
	ctx context.Context,
	client *domain.Contact,
	projectName string,
	total float64,
	validUntil time.Time,
	pdfURL string,
) error {
	if s.novu == nil {
		return nil
	}

	payload := map[string]interface{}{
		"client_name":  client.FullName(),
		"project_name": projectName,
		"total":        total,
		"valid_until":  validUntil.Format("January 2, 2006"),
		"pdf_url":      pdfURL,
	}

	return s.novu.Trigger(ctx, EventEstimateSent, client.ID.String(), payload)
}

// NotifyExpensePending sends a notification to all admins when an expense is pending review.
func (s *Service) NotifyExpensePending(
	ctx context.Context,
	vendorName string,
	amount float64,
	category string,
	receiptURL string,
) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"vendor_name": vendorName,
		"amount":      amount,
		"category":    category,
		"receipt_url": receiptURL,
	}

	return s.novu.BulkTrigger(ctx, EventExpensePending, subscriberIDs, payload)
}

// NotifyPaymentReceived sends a notification to all admins when a payment is received.
func (s *Service) NotifyPaymentReceived(
	ctx context.Context,
	amount float64,
	source string,
	reference string,
) error {
	if s.novu == nil {
		return nil
	}

	subscriberIDs, err := s.getAdminSubscriberIDs(ctx)
	if err != nil {
		return fmt.Errorf("getting admin subscribers: %w", err)
	}
	if len(subscriberIDs) == 0 {
		return nil
	}

	payload := map[string]interface{}{
		"amount":    amount,
		"source":    source,
		"reference": reference,
	}

	return s.novu.BulkTrigger(ctx, EventPaymentReceived, subscriberIDs, payload)
}

// SyncContactToNovu upserts a contact as a subscriber in Novu.
func (s *Service) SyncContactToNovu(ctx context.Context, contact *domain.Contact) error {
	if s.novu == nil {
		return nil
	}

	subscriber := novu.Subscriber{
		SubscriberID: contact.ID.String(),
		FirstName:    contact.FirstName,
		LastName:     contact.LastName,
	}

	if contact.Email != nil {
		subscriber.Email = *contact.Email
	}
	if contact.Phone != nil {
		subscriber.Phone = *contact.Phone
	}

	return s.novu.UpsertSubscriber(ctx, subscriber)
}
