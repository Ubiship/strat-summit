package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/config"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/repository"
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

// Auth methods

func (s *Service) Login(ctx context.Context, email, password string) (*domain.User, string, string, error) {
	// TODO: implement
	// 1. Get user by email
	// 2. Verify password with bcrypt
	// 3. Generate access token
	// 4. Generate refresh token
	// 5. Store refresh token hash
	// 6. Return user, access token, refresh token
	return nil, "", "", nil
}

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (string, string, error) {
	// TODO: implement
	return "", "", nil
}

func (s *Service) Logout(ctx context.Context, userID uuid.UUID) error {
	// TODO: implement
	return nil
}

// Property methods

func (s *Service) CreateProperty(ctx context.Context, p *domain.Property) error {
	return s.repo.CreateProperty(ctx, p)
}

func (s *Service) GetProperty(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	return s.repo.GetPropertyByID(ctx, id)
}

func (s *Service) ListProperties(ctx context.Context) ([]*domain.Property, error) {
	return s.repo.ListProperties(ctx)
}

// Booking methods

func (s *Service) CreateBooking(ctx context.Context, b *domain.Booking) error {
	// TODO: also create CleaningJob when booking is confirmed
	return s.repo.CreateBooking(ctx, b)
}

// CleaningJob methods

func (s *Service) UpdateJobStatus(ctx context.Context, id uuid.UUID, status string) error {
	return s.repo.UpdateCleaningJobStatus(ctx, id, status)
}
