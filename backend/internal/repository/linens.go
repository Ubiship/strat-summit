package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// GetPropertyLinens returns all linens configured for a property
func (r *Repository) GetPropertyLinens(ctx context.Context, propertyID uuid.UUID) ([]*domain.PropertyLinen, error) {
	query := `
		SELECT id, property_id, linen_type, bed_size, location, quantity, required_sets,
		       condition, last_deep_clean, turnovers_since_launder, notes, created_at, updated_at
		FROM property_linens
		WHERE property_id = $1
		ORDER BY linen_type, bed_size, location`

	rows, err := r.db.Query(ctx, query, propertyID)
	if err != nil {
		return nil, fmt.Errorf("getting property linens: %w", err)
	}
	defer rows.Close()

	var linens []*domain.PropertyLinen
	for rows.Next() {
		var pl domain.PropertyLinen
		err := rows.Scan(
			&pl.ID, &pl.PropertyID, &pl.LinenType, &pl.BedSize, &pl.Location,
			&pl.Quantity, &pl.RequiredSets, &pl.Condition, &pl.LastDeepClean,
			&pl.TurnoversSinceLaunder, &pl.Notes, &pl.CreatedAt, &pl.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning property linen: %w", err)
		}
		linens = append(linens, &pl)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating property linens: %w", err)
	}
	return linens, nil
}

// GetPropertyLinenByID returns a single linen by ID
func (r *Repository) GetPropertyLinenByID(ctx context.Context, id uuid.UUID) (*domain.PropertyLinen, error) {
	query := `
		SELECT id, property_id, linen_type, bed_size, location, quantity, required_sets,
		       condition, last_deep_clean, turnovers_since_launder, notes, created_at, updated_at
		FROM property_linens
		WHERE id = $1`

	var pl domain.PropertyLinen
	err := r.db.QueryRow(ctx, query, id).Scan(
		&pl.ID, &pl.PropertyID, &pl.LinenType, &pl.BedSize, &pl.Location,
		&pl.Quantity, &pl.RequiredSets, &pl.Condition, &pl.LastDeepClean,
		&pl.TurnoversSinceLaunder, &pl.Notes, &pl.CreatedAt, &pl.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying property linen: %w", err)
	}
	return &pl, nil
}

// CreatePropertyLinen inserts a new property linen record
func (r *Repository) CreatePropertyLinen(ctx context.Context, linen *domain.PropertyLinen) error {
	query := `
		INSERT INTO property_linens (
			property_id, linen_type, bed_size, location, quantity, required_sets,
			condition, last_deep_clean, turnovers_since_launder, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		linen.PropertyID, linen.LinenType, linen.BedSize, linen.Location,
		linen.Quantity, linen.RequiredSets, linen.Condition, linen.LastDeepClean,
		linen.TurnoversSinceLaunder, linen.Notes,
	).Scan(&linen.ID, &linen.CreatedAt, &linen.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating property linen: %w", err)
	}
	return nil
}

// UpdatePropertyLinen updates a property linen record
func (r *Repository) UpdatePropertyLinen(ctx context.Context, linen *domain.PropertyLinen) error {
	query := `
		UPDATE property_linens SET
			linen_type = $2, bed_size = $3, location = $4, quantity = $5, required_sets = $6,
			condition = $7, last_deep_clean = $8, turnovers_since_launder = $9, notes = $10,
			updated_at = now()
		WHERE id = $1
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		linen.ID, linen.LinenType, linen.BedSize, linen.Location,
		linen.Quantity, linen.RequiredSets, linen.Condition, linen.LastDeepClean,
		linen.TurnoversSinceLaunder, linen.Notes,
	).Scan(&linen.UpdatedAt)
	if err != nil {
		return fmt.Errorf("updating property linen: %w", err)
	}
	return nil
}

// DeletePropertyLinen deletes a property linen record
func (r *Repository) DeletePropertyLinen(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM property_linens WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting property linen: %w", err)
	}
	return nil
}

// IncrementLinenTurnovers increments turnovers_since_launder for all duvet_insert linens at a property
func (r *Repository) IncrementLinenTurnovers(ctx context.Context, propertyID uuid.UUID) error {
	query := `
		UPDATE property_linens
		SET turnovers_since_launder = turnovers_since_launder + 1, updated_at = now()
		WHERE property_id = $1 AND linen_type = 'duvet_insert'`
	_, err := r.db.Exec(ctx, query, propertyID)
	if err != nil {
		return fmt.Errorf("incrementing linen turnovers: %w", err)
	}
	return nil
}

// ResetLinenTurnovers resets turnovers_since_launder to 0 for a specific linen
func (r *Repository) ResetLinenTurnovers(ctx context.Context, linenID uuid.UUID) error {
	query := `UPDATE property_linens SET turnovers_since_launder = 0, updated_at = now() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, linenID)
	if err != nil {
		return fmt.Errorf("resetting linen turnovers: %w", err)
	}
	return nil
}

// CreateLinenRotationLog inserts a new linen rotation log entry
func (r *Repository) CreateLinenRotationLog(ctx context.Context, log *domain.LinenRotationLog) error {
	query := `
		INSERT INTO linen_rotation_log (property_linen_id, job_id, action, notes)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	err := r.db.QueryRow(ctx, query,
		log.PropertyLinenID, log.JobID, log.Action, log.Notes,
	).Scan(&log.ID, &log.CreatedAt)
	if err != nil {
		return fmt.Errorf("creating linen rotation log: %w", err)
	}
	return nil
}

// GetLinenRotationLogs returns rotation log entries for a property linen
func (r *Repository) GetLinenRotationLogs(ctx context.Context, propertyLinenID uuid.UUID) ([]*domain.LinenRotationLog, error) {
	query := `
		SELECT id, property_linen_id, job_id, action, notes, created_at
		FROM linen_rotation_log
		WHERE property_linen_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, propertyLinenID)
	if err != nil {
		return nil, fmt.Errorf("getting linen rotation logs: %w", err)
	}
	defer rows.Close()

	var logs []*domain.LinenRotationLog
	for rows.Next() {
		var log domain.LinenRotationLog
		err := rows.Scan(&log.ID, &log.PropertyLinenID, &log.JobID, &log.Action, &log.Notes, &log.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning linen rotation log: %w", err)
		}
		logs = append(logs, &log)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating linen rotation logs: %w", err)
	}
	return logs, nil
}

// GetLinensNeedingLaundry returns all duvet_insert linens that have reached the rotation threshold
func (r *Repository) GetLinensNeedingLaundry(ctx context.Context, threshold int) ([]*domain.LinenAlert, error) {
	query := `
		SELECT pl.id, pl.location, p.name as property_name, pl.bed_size, pl.turnovers_since_launder
		FROM property_linens pl
		JOIN properties p ON pl.property_id = p.id
		WHERE pl.linen_type = 'duvet_insert'
		  AND pl.turnovers_since_launder >= $1
		ORDER BY pl.turnovers_since_launder DESC, p.name`

	rows, err := r.db.Query(ctx, query, threshold)
	if err != nil {
		return nil, fmt.Errorf("getting linens needing laundry: %w", err)
	}
	defer rows.Close()

	var alerts []*domain.LinenAlert
	for rows.Next() {
		var linenID uuid.UUID
		var location, propertyName string
		var bedSize *string
		var turnovers int
		err := rows.Scan(&linenID, &location, &propertyName, &bedSize, &turnovers)
		if err != nil {
			return nil, fmt.Errorf("scanning linen alert: %w", err)
		}
		bedSizeStr := ""
		if bedSize != nil {
			bedSizeStr = *bedSize
		}
		alert := &domain.LinenAlert{
			LinenID:  linenID,
			Location: location,
			Message:  fmt.Sprintf("%s: %s %s duvet needs laundry (%d turnovers)", propertyName, bedSizeStr, location, turnovers),
		}
		alerts = append(alerts, alert)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating linen alerts: %w", err)
	}
	return alerts, nil
}
