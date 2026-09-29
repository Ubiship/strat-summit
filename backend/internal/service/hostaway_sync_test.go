package service

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/hostaway"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

// hostawayTestHelper extends mockRepository with hostaway-specific test support
type hostawayTestHelper struct {
	*mockRepository
	properties      map[string]*domain.Property
	bookingsByExtID map[string]*domain.Booking
	cleaningJobs    []*domain.CleaningJob
}

func newHostawayTestHelper() *hostawayTestHelper {
	return &hostawayTestHelper{
		mockRepository:  newMockRepository(),
		properties:      make(map[string]*domain.Property),
		bookingsByExtID: make(map[string]*domain.Booking),
		cleaningJobs:    make([]*domain.CleaningJob, 0),
	}
}

func (h *hostawayTestHelper) GetPropertyByHostawayID(ctx context.Context, hostawayID string) (*domain.Property, error) {
	if p, ok := h.properties[hostawayID]; ok {
		return p, nil
	}
	return nil, repository.ErrNotFound
}

func (h *hostawayTestHelper) GetBookingByExternalUID(ctx context.Context, uid string) (*domain.Booking, error) {
	if b, ok := h.bookingsByExtID[uid]; ok {
		return b, nil
	}
	return nil, repository.ErrNotFound
}

func (h *hostawayTestHelper) CreateBooking(ctx context.Context, b *domain.Booking) error {
	if h.shouldError {
		return fmt.Errorf("mock error")
	}
	b.ID = uuid.New()
	b.CreatedAt = time.Now()
	b.UpdatedAt = time.Now()
	if b.ExternalUID != nil {
		h.bookingsByExtID[*b.ExternalUID] = b
	}
	return nil
}

func (h *hostawayTestHelper) CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error {
	if h.shouldError {
		return fmt.Errorf("mock error")
	}
	j.ID = uuid.New()
	j.CreatedAt = time.Now()
	j.UpdatedAt = time.Now()
	h.cleaningJobs = append(h.cleaningJobs, j)
	return nil
}

func (h *hostawayTestHelper) GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error) {
	for _, j := range h.cleaningJobs {
		if j.ID == id {
			return j, nil
		}
	}
	return nil, repository.ErrNotFound
}

func (h *hostawayTestHelper) UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status domain.JobStatus) error {
	if h.shouldError {
		return fmt.Errorf("mock error")
	}
	for _, j := range h.cleaningJobs {
		if j.ID == id {
			j.Status = status
			j.UpdatedAt = time.Now()
			return nil
		}
	}
	return repository.ErrNotFound
}

func (h *hostawayTestHelper) UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID, notes string) error {
	if h.shouldError {
		return fmt.Errorf("mock error")
	}
	for _, b := range h.bookingsByExtID {
		if b.ID == bookingID {
			if b.Notes == nil {
				b.Notes = &notes
			} else {
				updated := *b.Notes + " " + notes
				b.Notes = &updated
			}
			b.UpdatedAt = time.Now()
			return nil
		}
	}
	return repository.ErrNotFound
}

func (h *hostawayTestHelper) UpdateBooking(ctx context.Context, b *domain.Booking) error {
	if h.shouldError {
		return fmt.Errorf("mock error")
	}
	for _, booking := range h.bookingsByExtID {
		if booking.ID == b.ID {
			*booking = *b
			booking.UpdatedAt = time.Now()
			return nil
		}
	}
	return repository.ErrNotFound
}

// Test: HandleHostawayReservationCreated creates booking and job
func TestHandleHostawayReservationCreated_CreatesBookingAndJob(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	// Setup: Create a property with Hostaway ID
	propertyID := uuid.New()
	property := &domain.Property{
		ID:     propertyID,
		Name:   "Test Property",
		HotTub: true,
	}
	helper.properties["12345"] = property

	// Create service with test helper
	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create Hostaway reservation
	reservation := &hostaway.Reservation{
		ID:           999,
		ListingID:    12345,
		CheckInDate:  "2024-01-15",
		CheckOutDate: "2024-01-20",
		GuestName:    "John Doe",
		GuestEmail:   "john@example.com",
		GuestPhone:   "555-1234",
		Source:       "airbnb",
		TotalPrice:   1000.00,
		Status:       "confirmed",
	}

	// Call the handler
	err := svc.HandleHostawayReservationCreated(ctx, reservation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify booking was created
	externalID := fmt.Sprintf("hostaway:%d", reservation.ID)
	booking, ok := helper.bookingsByExtID[externalID]
	if !ok {
		t.Error("expected booking to be created")
	}

	// Verify booking fields
	if booking.PropertyID != propertyID {
		t.Errorf("expected property_id %s, got %s", propertyID, booking.PropertyID)
	}
	if booking.Source != domain.BookingSourceAirbnb {
		t.Errorf("expected source airbnb, got %s", booking.Source)
	}
	if booking.GuestName == nil || *booking.GuestName != "John Doe" {
		t.Errorf("expected guest_name John Doe, got %v", booking.GuestName)
	}
	if booking.GuestEmail == nil || *booking.GuestEmail != "john@example.com" {
		t.Errorf("expected guest_email john@example.com, got %v", booking.GuestEmail)
	}

	// Verify cleaning job was created
	if len(helper.cleaningJobs) != 1 {
		t.Errorf("expected 1 cleaning job, got %d", len(helper.cleaningJobs))
	}
	job := helper.cleaningJobs[0]
	if job.PropertyID != propertyID {
		t.Errorf("expected job property_id %s, got %s", propertyID, job.PropertyID)
	}
	if job.BookingID == nil || *job.BookingID != booking.ID {
		t.Errorf("expected job booking_id %s, got %v", booking.ID, job.BookingID)
	}
	if job.Status != domain.JobStatusAssigned {
		t.Errorf("expected job status assigned, got %s", job.Status)
	}
	if job.HotTubPhotoRequired != true {
		t.Errorf("expected hot tub photo required true, got %v", job.HotTubPhotoRequired)
	}
}

// Test: HandleHostawayReservationCreated returns error for unknown property
func TestHandleHostawayReservationCreated_UnknownProperty(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create Hostaway reservation with non-existent listing ID
	reservation := &hostaway.Reservation{
		ID:           999,
		ListingID:    99999,
		CheckInDate:  "2024-01-15",
		CheckOutDate: "2024-01-20",
		GuestName:    "John Doe",
		GuestEmail:   "john@example.com",
		GuestPhone:   "555-1234",
		Source:       "airbnb",
		TotalPrice:   1000.00,
		Status:       "confirmed",
	}

	// Call the handler - should return error (property not found)
	err := svc.HandleHostawayReservationCreated(ctx, reservation)
	if err == nil {
		t.Error("expected error for unknown property")
	}

	// Verify no booking was created
	if len(helper.bookingsByExtID) != 0 {
		t.Errorf("expected 0 bookings, got %d", len(helper.bookingsByExtID))
	}
}

// Test: HandleHostawayReservationCreated with idempotency
func TestHandleHostawayReservationCreated_Idempotent(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	// Setup: Create a property with Hostaway ID
	propertyID := uuid.New()
	property := &domain.Property{
		ID:     propertyID,
		Name:   "Test Property",
		HotTub: false,
	}
	helper.properties["12345"] = property

	// Pre-create a booking (simulating idempotency check)
	existingBookingID := uuid.New()
	externalID := "hostaway:999"
	helper.bookingsByExtID[externalID] = &domain.Booking{
		ID:         existingBookingID,
		PropertyID: propertyID,
		Source:     domain.BookingSourceAirbnb,
	}

	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create Hostaway reservation
	reservation := &hostaway.Reservation{
		ID:           999,
		ListingID:    12345,
		CheckInDate:  "2024-01-15",
		CheckOutDate: "2024-01-20",
		GuestName:    "John Doe",
		GuestEmail:   "john@example.com",
		GuestPhone:   "555-1234",
		Source:       "airbnb",
		TotalPrice:   1000.00,
		Status:       "confirmed",
	}

	// Call the handler
	err := svc.HandleHostawayReservationCreated(ctx, reservation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify only one booking exists
	if len(helper.bookingsByExtID) != 1 {
		t.Errorf("expected 1 booking, got %d", len(helper.bookingsByExtID))
	}

	// Verify no new cleaning jobs were created (since booking already existed)
	if len(helper.cleaningJobs) > 0 {
		t.Errorf("expected 0 cleaning jobs for idempotent call, got %d", len(helper.cleaningJobs))
	}
}

// Test: HandleHostawayReservationCreated with VRBO source
func TestHandleHostawayReservationCreated_VRBOSource(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	// Setup: Create a property with Hostaway ID
	propertyID := uuid.New()
	property := &domain.Property{
		ID:     propertyID,
		Name:   "Test Property",
		HotTub: false,
	}
	helper.properties["54321"] = property

	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create VRBO reservation
	reservation := &hostaway.Reservation{
		ID:           888,
		ListingID:    54321,
		CheckInDate:  "2024-02-10",
		CheckOutDate: "2024-02-15",
		GuestName:    "Jane Smith",
		GuestEmail:   "jane@example.com",
		GuestPhone:   "555-5678",
		Source:       "vrbo",
		TotalPrice:   1200.00,
		Status:       "confirmed",
	}

	// Call the handler
	err := svc.HandleHostawayReservationCreated(ctx, reservation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify booking source is VRBO
	externalID := fmt.Sprintf("hostaway:%d", reservation.ID)
	booking, ok := helper.bookingsByExtID[externalID]
	if !ok {
		t.Fatal("booking should exist")
	}
	if booking.Source != domain.BookingSourceVRBO {
		t.Errorf("expected source vrbo, got %s", booking.Source)
	}
}

// Test: HandleHostawayReservationUpdated updates booking
func TestHandleHostawayReservationUpdated(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	// Setup: Create property and existing booking
	propertyID := uuid.New()
	property := &domain.Property{
		ID:     propertyID,
		Name:   "Test Property",
		HotTub: false,
	}
	helper.properties["12345"] = property

	existingBookingID := uuid.New()
	externalID := "hostaway:999"
	oldName := "Old Name"
	helper.bookingsByExtID[externalID] = &domain.Booking{
		ID:         existingBookingID,
		PropertyID: propertyID,
		Source:     domain.BookingSourceAirbnb,
		GuestName:  &oldName,
	}

	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create updated Hostaway reservation
	reservation := &hostaway.Reservation{
		ID:           999,
		ListingID:    12345,
		CheckInDate:  "2024-01-15",
		CheckOutDate: "2024-01-22",
		GuestName:    "Jane Doe",
		GuestEmail:   "jane@example.com",
		GuestPhone:   "555-5678",
		Source:       "vrbo",
		TotalPrice:   1200.00,
		Status:       "modified",
	}

	// Call the handler
	err := svc.HandleHostawayReservationUpdated(ctx, reservation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify booking was updated
	booking := helper.bookingsByExtID[externalID]
	if booking == nil {
		t.Error("booking should still exist")
	}
	if booking.GuestName == nil || *booking.GuestName != "Jane Doe" {
		t.Errorf("expected guest_name to be updated to Jane Doe, got %v", booking.GuestName)
	}
}

// Test: HandleHostawayReservationCancelled cancels booking
func TestHandleHostawayReservationCancelled(t *testing.T) {
	ctx := context.Background()
	helper := newHostawayTestHelper()

	// Setup: Create property and existing booking with cleaning job
	propertyID := uuid.New()
	property := &domain.Property{
		ID:     propertyID,
		Name:   "Test Property",
		HotTub: false,
	}
	helper.properties["12345"] = property

	existingBookingID := uuid.New()
	externalID := "hostaway:999"
	jobID := uuid.New()
	helper.bookingsByExtID[externalID] = &domain.Booking{
		ID:             existingBookingID,
		PropertyID:     propertyID,
		Source:         domain.BookingSourceAirbnb,
		CleaningJobID:  &jobID,
	}

	helper.cleaningJobs = append(helper.cleaningJobs, &domain.CleaningJob{
		ID:        jobID,
		BookingID: &existingBookingID,
		Status:    domain.JobStatusAssigned,
	})

	svc := &Service{
		cfg:      nil,
		repo:     helper,
		novu:     nil,
		chatwoot: nil,
		hostaway: nil,
	}

	// Create cancelled Hostaway reservation
	reservation := &hostaway.Reservation{
		ID:           999,
		ListingID:    12345,
		CheckInDate:  "2024-01-15",
		CheckOutDate: "2024-01-20",
		GuestName:    "John Doe",
		GuestEmail:   "john@example.com",
		GuestPhone:   "555-1234",
		Source:       "airbnb",
		TotalPrice:   1000.00,
		Status:       "cancelled",
	}

	// Call the handler
	err := svc.HandleHostawayReservationCancelled(ctx, reservation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify cleaning job status was updated to flagged
	job, _ := helper.GetCleaningJobByID(ctx, jobID)
	if job == nil {
		t.Error("cleaning job should still exist")
	} else if job.Status != domain.JobStatusFlagged {
		t.Errorf("expected job status flagged, got %s", job.Status)
	}

	// Verify booking notes indicate cancellation
	booking := helper.bookingsByExtID[externalID]
	if booking.Notes == nil || *booking.Notes == "" {
		t.Error("booking notes should indicate cancellation")
	}
}
