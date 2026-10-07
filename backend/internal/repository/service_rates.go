package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// ListServiceRates returns all service rates ordered by service type
func (r *Repository) ListServiceRates(ctx context.Context) ([]*domain.ServiceRate, error) {
	query := `
		SELECT id, service_type, rate, min_charge, effective_date, created_at, updated_at
		FROM service_rates
		ORDER BY service_type`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("listing service rates: %w", err)
	}
	defer rows.Close()

	var rates []*domain.ServiceRate
	for rows.Next() {
		var sr domain.ServiceRate
		err := rows.Scan(
			&sr.ID, &sr.ServiceType, &sr.Rate, &sr.MinCharge,
			&sr.EffectiveDate, &sr.CreatedAt, &sr.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning service rate: %w", err)
		}
		rates = append(rates, &sr)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating service rates: %w", err)
	}
	return rates, nil
}

// GetServiceRate returns a service rate by service type
func (r *Repository) GetServiceRate(ctx context.Context, serviceType string) (*domain.ServiceRate, error) {
	query := `
		SELECT id, service_type, rate, min_charge, effective_date, created_at, updated_at
		FROM service_rates
		WHERE service_type = $1`

	var sr domain.ServiceRate
	err := r.db.QueryRow(ctx, query, serviceType).Scan(
		&sr.ID, &sr.ServiceType, &sr.Rate, &sr.MinCharge,
		&sr.EffectiveDate, &sr.CreatedAt, &sr.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying service rate: %w", err)
	}
	return &sr, nil
}

// UpdateServiceRate updates a service rate
func (r *Repository) UpdateServiceRate(ctx context.Context, rate *domain.ServiceRate) error {
	query := `
		UPDATE service_rates SET
			rate = $2, min_charge = $3, effective_date = $4, updated_at = now()
		WHERE service_type = $1
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		rate.ServiceType, rate.Rate, rate.MinCharge, rate.EffectiveDate,
	).Scan(&rate.UpdatedAt)
	if err != nil {
		return fmt.Errorf("updating service rate: %w", err)
	}
	return nil
}
