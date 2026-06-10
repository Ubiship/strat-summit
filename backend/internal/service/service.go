package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/chatwoot"
	"github.com/ubiship/strat-summit/backend/internal/integrations/novu"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrInvalidRefresh     = errors.New("invalid refresh token")
	ErrForbidden          = errors.New("forbidden")
)

// Repository defines the data access methods required by Service.
// This interface allows for easier testing with mocks.
type Repository interface {
	// User methods
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	UpdateRefreshToken(ctx context.Context, userID uuid.UUID, hash *string, expiresAt *time.Time) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error

	// Contact methods
	CreateContact(ctx context.Context, c *domain.Contact) error
	GetContactByID(ctx context.Context, id uuid.UUID) (*domain.Contact, error)
	GetContactByEmail(ctx context.Context, email string) (*domain.Contact, error)
	ListContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.Contact, error)
	ListContactsByRole(ctx context.Context, role domain.UserRole, opts domain.ListOptions) ([]*domain.Contact, error)
	FindContactByPhone(ctx context.Context, phone string) (*domain.Contact, error)
	FindContactByChatwootID(ctx context.Context, chatwootID int64) (*domain.Contact, error)
	SetChatwootContactID(ctx context.Context, contactID uuid.UUID, chatwootID int64) error
	UpdateContact(ctx context.Context, c *domain.Contact) error

	// Property methods
	CreateProperty(ctx context.Context, p *domain.Property) error
	GetPropertyByID(ctx context.Context, id uuid.UUID) (*domain.Property, error)
	ListProperties(ctx context.Context, opts domain.ListOptions) ([]*domain.Property, error)
	GetPropertiesByOwner(ctx context.Context, contactID uuid.UUID) ([]*domain.Property, error)
	OwnerHasProperty(ctx context.Context, contactID, propertyID uuid.UUID) (bool, error)
	UpdateProperty(ctx context.Context, p *domain.Property) error

	// Booking methods
	CreateBooking(ctx context.Context, b *domain.Booking) error
	GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error)
	ListBookingsByProperty(ctx context.Context, propertyID uuid.UUID, opts domain.ListOptions) ([]*domain.Booking, error)
	FindOpenBookingByOwner(ctx context.Context, ownerID uuid.UUID) (*domain.Booking, error)
	SetBookingChatwootConversation(ctx context.Context, bookingID uuid.UUID, conversationID int64) error
	FindBookingByChatwootConversation(ctx context.Context, conversationID int64) (*domain.Booking, error)
	UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID, notes string) error

	// Cleaning job methods
	CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error
	GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error)
	UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status domain.JobStatus) error
	ClockInCleaningJob(ctx context.Context, id uuid.UUID) error
	ClockOutCleaningJob(ctx context.Context, id uuid.UUID) error
	ListCleaningJobsByDate(ctx context.Context, date time.Time) ([]*domain.CleaningJob, error)
	ListCleaningJobsByStaff(ctx context.Context, contactID uuid.UUID, date *time.Time, opts domain.ListOptions) ([]*domain.CleaningJob, error)
	IsStaffAssignedToJob(ctx context.Context, jobID, contactID uuid.UUID) (bool, error)
	AssignStaffToJob(ctx context.Context, jobID, contactID uuid.UUID, hourlyRate float64) error

	// Project methods
	FindOpenProjectByClient(ctx context.Context, clientID uuid.UUID) (*domain.Project, error)
	SetProjectChatwootConversation(ctx context.Context, projectID uuid.UUID, conversationID int64) error
	FindProjectByChatwootConversation(ctx context.Context, conversationID int64) (*domain.Project, error)
	SetProjectConversationResolved(ctx context.Context, projectID uuid.UUID, resolved bool) error

	// Chatwoot sync methods
	CreateChatwootEvent(ctx context.Context, event *domain.ChatwootEvent) error
	ListUnreviewedPendingContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.PendingContact, error)
	GetPendingContactByID(ctx context.Context, id uuid.UUID) (*domain.PendingContact, error)
	GetPendingContactByChatwootID(ctx context.Context, chatwootID int64) (*domain.PendingContact, error)
	CreatePendingContact(ctx context.Context, pc *domain.PendingContact) error
	MarkPendingContactReviewed(ctx context.Context, id, reviewerID uuid.UUID, action string, mergedWithID *uuid.UUID) error
}

// Service handles business logic
type Service struct {
	cfg      *config.Config
	repo     Repository
	novu     *novu.Client
	chatwoot *chatwoot.Client
}

// New creates a new Service instance
func New(cfg *config.Config, repo *repository.Repository, novuClient *novu.Client, chatwootClient *chatwoot.Client) *Service {
	return &Service{
		cfg:      cfg,
		repo:     repo,
		novu:     novuClient,
		chatwoot: chatwootClient,
	}
}

// Novu returns the Novu client for notification triggering.
// Returns nil if Novu is not configured.
func (s *Service) Novu() *novu.Client {
	return s.novu
}

// Chatwoot returns the Chatwoot client for contact/conversation management.
// Returns nil if Chatwoot is not configured.
func (s *Service) Chatwoot() *chatwoot.Client {
	return s.chatwoot
}

// ============================================================================
// Auth Service
// ============================================================================

// Login authenticates a user and returns tokens
func (s *Service) Login(ctx context.Context, email, password string) (*domain.User, string, string, error) {
	// Get user by email
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, "", "", ErrInvalidCredentials
		}
		return nil, "", "", fmt.Errorf("getting user: %w", err)
	}

	// Check if user is active
	if !user.Active {
		return nil, "", "", ErrUserInactive
	}

	// Verify password
	if err := auth.CheckPassword(password, user.PasswordHash); err != nil {
		return nil, "", "", ErrInvalidCredentials
	}

	// Generate access token
	accessToken, err := auth.GenerateAccessToken(user, []byte(s.cfg.JWTSecret), s.cfg.JWTAccessTTL)
	if err != nil {
		return nil, "", "", fmt.Errorf("generating access token: %w", err)
	}

	// Generate refresh token
	refreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		return nil, "", "", fmt.Errorf("generating refresh token: %w", err)
	}

	// Hash and store refresh token
	refreshHash, err := auth.HashRefreshToken(refreshToken)
	if err != nil {
		return nil, "", "", fmt.Errorf("hashing refresh token: %w", err)
	}

	expiresAt := time.Now().Add(s.cfg.JWTRefreshTTL)
	if err := s.repo.UpdateRefreshToken(ctx, user.ID, &refreshHash, &expiresAt); err != nil {
		return nil, "", "", fmt.Errorf("storing refresh token: %w", err)
	}

	// Update last login
	if err := s.repo.UpdateLastLogin(ctx, user.ID); err != nil {
		return nil, "", "", fmt.Errorf("updating last login: %w", err)
	}

	return user, accessToken, refreshToken, nil
}

// RefreshToken generates new tokens using a refresh token
func (s *Service) RefreshToken(ctx context.Context, userID uuid.UUID, refreshToken string) (string, string, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return "", "", fmt.Errorf("getting user: %w", err)
	}

	// Check if user is active
	if !user.Active {
		return "", "", ErrUserInactive
	}

	// Verify refresh token
	if user.RefreshTokenHash == nil || user.RefreshTokenExpiresAt == nil {
		return "", "", ErrInvalidRefresh
	}

	if time.Now().After(*user.RefreshTokenExpiresAt) {
		return "", "", ErrInvalidRefresh
	}

	if err := auth.CheckRefreshToken(refreshToken, *user.RefreshTokenHash); err != nil {
		return "", "", ErrInvalidRefresh
	}

	// Generate new access token
	accessToken, err := auth.GenerateAccessToken(user, []byte(s.cfg.JWTSecret), s.cfg.JWTAccessTTL)
	if err != nil {
		return "", "", fmt.Errorf("generating access token: %w", err)
	}

	// Generate new refresh token (rotation)
	newRefreshToken, err := auth.GenerateRefreshToken()
	if err != nil {
		return "", "", fmt.Errorf("generating refresh token: %w", err)
	}

	// Hash and store new refresh token
	refreshHash, err := auth.HashRefreshToken(newRefreshToken)
	if err != nil {
		return "", "", fmt.Errorf("hashing refresh token: %w", err)
	}

	expiresAt := time.Now().Add(s.cfg.JWTRefreshTTL)
	if err := s.repo.UpdateRefreshToken(ctx, user.ID, &refreshHash, &expiresAt); err != nil {
		return "", "", fmt.Errorf("storing refresh token: %w", err)
	}

	return accessToken, newRefreshToken, nil
}

// Logout invalidates a user's refresh token
func (s *Service) Logout(ctx context.Context, userID uuid.UUID) error {
	return s.repo.UpdateRefreshToken(ctx, userID, nil, nil)
}

// ============================================================================
// Contact Service
// ============================================================================

func (s *Service) CreateContact(ctx context.Context, c *domain.Contact) error {
	if err := s.repo.CreateContact(ctx, c); err != nil {
		return fmt.Errorf("creating contact: %w", err)
	}

	// Sync to Novu for notifications
	if err := s.SyncContactToNovu(ctx, c); err != nil {
		log.Printf("novu sync failed for contact %s: %v", c.ID, err)
	}

	// Sync to Chatwoot for inbox
	if err := s.PushContactToChatwoot(ctx, c); err != nil {
		log.Printf("chatwoot sync failed for contact %s: %v", c.ID, err)
	}

	return nil
}

func (s *Service) GetContact(ctx context.Context, id uuid.UUID) (*domain.Contact, error) {
	return s.repo.GetContactByID(ctx, id)
}

func (s *Service) ListContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.Contact, error) {
	return s.repo.ListContacts(ctx, opts)
}

func (s *Service) ListCleaners(ctx context.Context, opts domain.ListOptions) ([]*domain.Contact, error) {
	return s.repo.ListContactsByRole(ctx, domain.RoleCleaner, opts)
}

// ============================================================================
// Property Service
// ============================================================================

func (s *Service) CreateProperty(ctx context.Context, auth *domain.AuthContext, p *domain.Property) error {
	// Only admin can create properties
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.CreateProperty(ctx, p)
}

func (s *Service) GetProperty(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) (*domain.Property, error) {
	property, err := s.repo.GetPropertyByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Access control
	switch auth.Role {
	case domain.RoleAdmin, domain.RoleBookkeeper:
		return property, nil
	case domain.RolePMOwner:
		hasAccess, err := s.repo.OwnerHasProperty(ctx, auth.ContactID, id)
		if err != nil {
			return nil, err
		}
		if !hasAccess {
			return nil, ErrForbidden
		}
		return property, nil
	default:
		return nil, ErrForbidden
	}
}

func (s *Service) ListProperties(ctx context.Context, auth *domain.AuthContext, opts domain.ListOptions) ([]*domain.Property, error) {
	switch auth.Role {
	case domain.RoleAdmin, domain.RoleBookkeeper:
		return s.repo.ListProperties(ctx, opts)
	case domain.RolePMOwner:
		return s.repo.GetPropertiesByOwner(ctx, auth.ContactID)
	default:
		return nil, ErrForbidden
	}
}

func (s *Service) UpdateProperty(ctx context.Context, auth *domain.AuthContext, p *domain.Property) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.UpdateProperty(ctx, p)
}

// ============================================================================
// Booking Service
// ============================================================================

func (s *Service) CreateBooking(ctx context.Context, auth *domain.AuthContext, b *domain.Booking) error {
	// Only admin can create bookings
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	// Derive tax treatment from source
	switch b.Source {
	case domain.BookingSourceAirbnb, domain.BookingSourceVRBO:
		b.TaxTreatment = domain.TaxTreatmentAirbnbManaged
		b.GST = 0
		b.PST = 0
		b.MRDT = 0
	case domain.BookingSourceDirect, domain.BookingSourcePlatform:
		b.TaxTreatment = domain.TaxTreatmentDirect
		// GST/PST/MRDT will be calculated elsewhere
	case domain.BookingSourceOwnerUse:
		b.TaxTreatment = domain.TaxTreatmentNone
	}

	if err := s.repo.CreateBooking(ctx, b); err != nil {
		return err
	}

	// Auto-create cleaning job for checkout day
	property, err := s.repo.GetPropertyByID(ctx, b.PropertyID)
	if err != nil {
		return fmt.Errorf("getting property for cleaning job: %w", err)
	}

	job := &domain.CleaningJob{
		PropertyID:          b.PropertyID,
		BookingID:           &b.ID,
		ScheduledDate:       b.CheckOut,
		Status:              domain.JobStatusAssigned,
		CompModel:           domain.CompModelHourly,
		HotTubPhotoRequired: property.HotTub,
	}

	if err := s.repo.CreateCleaningJob(ctx, job); err != nil {
		return fmt.Errorf("creating cleaning job: %w", err)
	}

	// Notify admins of new booking
	if err := s.NotifyBookingConfirmed(ctx, b, property); err != nil {
		log.Printf("failed to send booking notification: %v", err)
	}

	// Create Chatwoot conversation for guest communication
	if err := s.CreateBookingConversation(ctx, b); err != nil {
		log.Printf("failed to create chatwoot conversation for booking %s: %v", b.ID, err)
	}

	return nil
}

func (s *Service) GetBooking(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) (*domain.Booking, error) {
	booking, err := s.repo.GetBookingByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Access control
	switch auth.Role {
	case domain.RoleAdmin, domain.RoleBookkeeper:
		return booking, nil
	case domain.RolePMOwner:
		hasAccess, err := s.repo.OwnerHasProperty(ctx, auth.ContactID, booking.PropertyID)
		if err != nil {
			return nil, err
		}
		if !hasAccess {
			return nil, ErrForbidden
		}
		return booking, nil
	default:
		return nil, ErrForbidden
	}
}

func (s *Service) ListBookingsByProperty(ctx context.Context, auth *domain.AuthContext, propertyID uuid.UUID, opts domain.ListOptions) ([]*domain.Booking, error) {
	// Check property access
	switch auth.Role {
	case domain.RoleAdmin, domain.RoleBookkeeper:
		// Full access
	case domain.RolePMOwner:
		hasAccess, err := s.repo.OwnerHasProperty(ctx, auth.ContactID, propertyID)
		if err != nil {
			return nil, err
		}
		if !hasAccess {
			return nil, ErrForbidden
		}
	default:
		return nil, ErrForbidden
	}

	return s.repo.ListBookingsByProperty(ctx, propertyID, opts)
}

// ============================================================================
// Cleaning Job Service
// ============================================================================

func (s *Service) GetCleaningJob(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) (*domain.CleaningJob, error) {
	job, err := s.repo.GetCleaningJobByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Access control
	switch auth.Role {
	case domain.RoleAdmin, domain.RoleBookkeeper:
		return job, nil
	case domain.RoleCleaner:
		// Cleaners can only see jobs assigned to them
		assigned, err := s.repo.IsStaffAssignedToJob(ctx, id, auth.ContactID)
		if err != nil {
			return nil, err
		}
		if !assigned {
			return nil, ErrForbidden
		}
		return job, nil
	default:
		return nil, ErrForbidden
	}
}

func (s *Service) ListCleaningJobsByDate(ctx context.Context, auth *domain.AuthContext, date time.Time) ([]*domain.CleaningJob, error) {
	switch auth.Role {
	case domain.RoleAdmin:
		return s.repo.ListCleaningJobsByDate(ctx, date)
	case domain.RoleCleaner:
		// Filter to only their jobs for the specified date
		return s.repo.ListCleaningJobsByStaff(ctx, auth.ContactID, &date, domain.ListOptions{Limit: 100})
	default:
		return nil, ErrForbidden
	}
}

func (s *Service) ClockInJob(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) error {
	if auth.Role != domain.RoleCleaner && auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	// Verify cleaner is assigned to this job (admin can clock in anyone)
	if auth.Role == domain.RoleCleaner {
		assigned, err := s.repo.IsStaffAssignedToJob(ctx, id, auth.ContactID)
		if err != nil {
			return fmt.Errorf("checking job assignment: %w", err)
		}
		if !assigned {
			return ErrForbidden
		}
	}

	return s.repo.ClockInCleaningJob(ctx, id)
}

func (s *Service) ClockOutJob(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) error {
	if auth.Role != domain.RoleCleaner && auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	// Verify cleaner is assigned to this job (admin can clock out anyone)
	if auth.Role == domain.RoleCleaner {
		assigned, err := s.repo.IsStaffAssignedToJob(ctx, id, auth.ContactID)
		if err != nil {
			return fmt.Errorf("checking job assignment: %w", err)
		}
		if !assigned {
			return ErrForbidden
		}
	}

	if err := s.repo.ClockOutCleaningJob(ctx, id); err != nil {
		return fmt.Errorf("clocking out: %w", err)
	}

	// Notify admins of job completion
	job, err := s.repo.GetCleaningJobByID(ctx, id)
	if err != nil {
		return nil
	}
	if job.Status == domain.JobStatusComplete {
		property, err := s.repo.GetPropertyByID(ctx, job.PropertyID)
		if err != nil {
			return nil
		}
		_ = s.NotifyJobCompleted(ctx, job, property)
	}

	return nil
}

func (s *Service) UpdateJobStatus(ctx context.Context, auth *domain.AuthContext, id uuid.UUID, status domain.JobStatus) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.UpdateCleaningJobStatus(ctx, id, status)
}

func (s *Service) AssignStaffToJob(ctx context.Context, auth *domain.AuthContext, jobID, contactID uuid.UUID, hourlyRate float64) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	if err := s.repo.AssignStaffToJob(ctx, jobID, contactID, hourlyRate); err != nil {
		return fmt.Errorf("assigning staff: %w", err)
	}

	// Trigger notification (fire and forget - don't fail the operation if notification fails)
	job, err := s.repo.GetCleaningJobByID(ctx, jobID)
	if err != nil {
		return nil // Assignment succeeded, notification failed - acceptable
	}
	staff, err := s.repo.GetContactByID(ctx, contactID)
	if err != nil {
		return nil
	}
	property, err := s.repo.GetPropertyByID(ctx, job.PropertyID)
	if err != nil {
		return nil
	}

	_ = s.NotifyJobAssigned(ctx, job, staff, property)

	return nil
}
