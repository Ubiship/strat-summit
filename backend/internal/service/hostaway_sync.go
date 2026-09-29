package service

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/hostaway"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

// HandleHostawayReservationCreated handles a new reservation created event from Hostaway.
// It creates a booking and an associated cleaning job.
func (s *Service) HandleHostawayReservationCreated(ctx context.Context, reservation *hostaway.Reservation) error {
	// Look up property by Hostaway listing ID
	hostawayID := fmt.Sprintf("%d", reservation.ListingID)
	property, err := s.repo.GetPropertyByHostawayID(ctx, hostawayID)
	if err != nil {
		if err == repository.ErrNotFound {
			log.Printf("hostaway sync: property not found for hostaway_id %s, skipping reservation %d", hostawayID, reservation.ID)
			return fmt.Errorf("property with hostaway_id %s not found", hostawayID)
		}
		return fmt.Errorf("getting property by hostaway id: %w", err)
	}

	// Check if booking already exists (idempotency)
	externalID := fmt.Sprintf("hostaway:%d", reservation.ID)
	existingBooking, err := s.repo.GetBookingByExternalUID(ctx, externalID)
	if err == nil && existingBooking != nil {
		// Booking already exists, skip creation
		log.Printf("hostaway sync: booking already exists for external_id %s", externalID)
		return nil
	}
	if err != nil && err != repository.ErrNotFound {
		return fmt.Errorf("checking existing booking: %w", err)
	}

	// Parse check-in and check-out dates
	checkIn, err := time.Parse("2006-01-02", reservation.CheckInDate)
	if err != nil {
		return fmt.Errorf("parsing check_in date: %w", err)
	}
	checkOut, err := time.Parse("2006-01-02", reservation.CheckOutDate)
	if err != nil {
		return fmt.Errorf("parsing check_out date: %w", err)
	}

	// Map Hostaway source to domain BookingSource
	var bookingSource domain.BookingSource
	switch reservation.Source {
	case "airbnb":
		bookingSource = domain.BookingSourceAirbnb
	case "vrbo":
		bookingSource = domain.BookingSourceVRBO
	case "hostaway":
		bookingSource = domain.BookingSourceHostaway
	default:
		bookingSource = domain.BookingSourcePlatform
	}

	// Create booking
	booking := &domain.Booking{
		PropertyID:   property.ID,
		Source:       bookingSource,
		ExternalUID:  &externalID,
		GuestName:    &reservation.GuestName,
		GuestEmail:   &reservation.GuestEmail,
		GuestPhone:   &reservation.GuestPhone,
		CheckIn:      checkIn,
		CheckOut:     checkOut,
		NightlyRate:  &reservation.TotalPrice,
	}

	// Set tax treatment based on source
	switch bookingSource {
	case domain.BookingSourceAirbnb, domain.BookingSourceVRBO:
		booking.TaxTreatment = domain.TaxTreatmentAirbnbManaged
		booking.GST = 0
		booking.PST = 0
		booking.MRDT = 0
	case domain.BookingSourceHostaway, domain.BookingSourcePlatform:
		booking.TaxTreatment = domain.TaxTreatmentDirect
	}

	if err := s.repo.CreateBooking(ctx, booking); err != nil {
		return fmt.Errorf("creating booking: %w", err)
	}

	// Create cleaning job for checkout day
	job := &domain.CleaningJob{
		PropertyID:          property.ID,
		BookingID:           &booking.ID,
		ScheduledDate:       checkOut,
		Status:              domain.JobStatusAssigned,
		CompModel:           domain.CompModelHourly,
		HotTubPhotoRequired: property.HotTub,
	}

	if err := s.repo.CreateCleaningJob(ctx, job); err != nil {
		return fmt.Errorf("creating cleaning job: %w", err)
	}

	// Log successful sync
	log.Printf("hostaway sync: created booking %s and cleaning job %s for reservation %d", booking.ID, job.ID, reservation.ID)

	return nil
}

// HandleHostawayReservationUpdated handles a reservation updated event from Hostaway.
// It updates the associated booking and cleaning job if they exist.
func (s *Service) HandleHostawayReservationUpdated(ctx context.Context, reservation *hostaway.Reservation) error {
	// Find existing booking by external ID
	externalID := fmt.Sprintf("hostaway:%d", reservation.ID)
	booking, err := s.repo.GetBookingByExternalUID(ctx, externalID)
	if err != nil {
		if err == repository.ErrNotFound {
			log.Printf("hostaway sync: booking not found for external_id %s, skipping update for reservation %d", externalID, reservation.ID)
			return fmt.Errorf("booking with external_id %s not found", externalID)
		}
		return fmt.Errorf("getting booking by external uid: %w", err)
	}

	// Parse updated dates
	checkIn, err := time.Parse("2006-01-02", reservation.CheckInDate)
	if err != nil {
		return fmt.Errorf("parsing check_in date: %w", err)
	}
	checkOut, err := time.Parse("2006-01-02", reservation.CheckOutDate)
	if err != nil {
		return fmt.Errorf("parsing check_out date: %w", err)
	}

	// Update booking fields
	booking.GuestName = &reservation.GuestName
	booking.GuestEmail = &reservation.GuestEmail
	booking.GuestPhone = &reservation.GuestPhone
	booking.CheckIn = checkIn
	booking.CheckOut = checkOut
	booking.NightlyRate = &reservation.TotalPrice

	if err := s.repo.UpdateBookingStatus(ctx, booking.ID, fmt.Sprintf("Updated from Hostaway: %s", reservation.Status)); err != nil {
		return fmt.Errorf("updating booking: %w", err)
	}

	log.Printf("hostaway sync: updated booking %s for reservation %d", booking.ID, reservation.ID)

	return nil
}

// HandleHostawayReservationCancelled handles a reservation cancelled event from Hostaway.
// It marks the booking and associated cleaning job as cancelled/flagged.
func (s *Service) HandleHostawayReservationCancelled(ctx context.Context, reservation *hostaway.Reservation) error {
	// Find existing booking by external ID
	externalID := fmt.Sprintf("hostaway:%d", reservation.ID)
	booking, err := s.repo.GetBookingByExternalUID(ctx, externalID)
	if err != nil {
		if err == repository.ErrNotFound {
			log.Printf("hostaway sync: booking not found for external_id %s, skipping cancellation for reservation %d", externalID, reservation.ID)
			return fmt.Errorf("booking with external_id %s not found", externalID)
		}
		return fmt.Errorf("getting booking by external uid: %w", err)
	}

	// Update booking status with cancellation note
	if err := s.repo.UpdateBookingStatus(ctx, booking.ID, "CANCELLED: Hostaway reservation was cancelled"); err != nil {
		return fmt.Errorf("updating booking status: %w", err)
	}

	// Flag associated cleaning job
	if booking.CleaningJobID != nil {
		if err := s.repo.UpdateCleaningJobStatus(ctx, *booking.CleaningJobID, domain.JobStatusFlagged); err != nil {
			log.Printf("hostaway sync: failed to flag cleaning job %s: %v", booking.CleaningJobID, err)
			// Don't fail the cancellation if job flagging fails
		}
	}

	log.Printf("hostaway sync: cancelled booking %s for reservation %d", booking.ID, reservation.ID)

	return nil
}
