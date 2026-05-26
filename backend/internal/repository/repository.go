package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// Repository provides data access methods
type Repository struct {
	db *pgxpool.Pool
}

// New creates a new Repository instance
func New(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// User methods

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) UpdateRefreshToken(ctx context.Context, userID uuid.UUID, hash *string, expiresAt *string) error {
	// TODO: implement
	return nil
}

// Property methods

func (r *Repository) CreateProperty(ctx context.Context, p *domain.Property) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetPropertyByID(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) ListProperties(ctx context.Context) ([]*domain.Property, error) {
	// TODO: implement
	return nil, nil
}

// Booking methods

func (r *Repository) CreateBooking(ctx context.Context, b *domain.Booking) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	// TODO: implement
	return nil, nil
}

// CleaningJob methods

func (r *Repository) CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error {
	// TODO: implement
	return nil
}

func (r *Repository) GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error) {
	// TODO: implement
	return nil, nil
}

func (r *Repository) UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status string) error {
	// TODO: implement
	return nil
}
