package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/auth"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrInvalidRefresh     = errors.New("invalid refresh token")
	ErrForbidden          = errors.New("forbidden")
)

// Service handles business logic
type Service struct {
	cfg  *config.Config
	repo *repository.Repository
}

// New creates a new Service instance
func New(cfg *config.Config, repo *repository.Repository) *Service {
	return &Service{
		cfg:  cfg,
		repo: repo,
	}
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
	return s.repo.CreateContact(ctx, c)
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

	return s.repo.CreateCleaningJob(ctx, job)
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

	return s.repo.ClockOutCleaningJob(ctx, id)
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
	return s.repo.AssignStaffToJob(ctx, jobID, contactID, hourlyRate)
}
