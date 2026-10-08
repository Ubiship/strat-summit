package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// ListConsumables returns all consumables
func (r *Repository) ListConsumables(ctx context.Context) ([]*domain.Consumable, error) {
	query := `
		SELECT id, name, category, is_standard, unit, created_at
		FROM consumables
		ORDER BY category, name`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("listing consumables: %w", err)
	}
	defer rows.Close()

	var consumables []*domain.Consumable
	for rows.Next() {
		var c domain.Consumable
		err := rows.Scan(&c.ID, &c.Name, &c.Category, &c.IsStandard, &c.Unit, &c.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning consumable: %w", err)
		}
		consumables = append(consumables, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating consumables: %w", err)
	}
	return consumables, nil
}

// ListStandardConsumables returns only standard consumables
func (r *Repository) ListStandardConsumables(ctx context.Context) ([]*domain.Consumable, error) {
	query := `
		SELECT id, name, category, is_standard, unit, created_at
		FROM consumables
		WHERE is_standard = true
		ORDER BY category, name`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("listing standard consumables: %w", err)
	}
	defer rows.Close()

	var consumables []*domain.Consumable
	for rows.Next() {
		var c domain.Consumable
		err := rows.Scan(&c.ID, &c.Name, &c.Category, &c.IsStandard, &c.Unit, &c.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning consumable: %w", err)
		}
		consumables = append(consumables, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating standard consumables: %w", err)
	}
	return consumables, nil
}

// GetPropertyConsumables returns consumables configured for a property with full consumable details
func (r *Repository) GetPropertyConsumables(ctx context.Context, propertyID uuid.UUID) ([]*domain.PropertyConsumable, error) {
	query := `
		SELECT pc.id, pc.property_id, pc.consumable_id, pc.enabled, pc.par_level, pc.notes,
		       pc.created_at, pc.updated_at,
		       c.name, c.category, c.is_standard, c.unit
		FROM property_consumables pc
		JOIN consumables c ON pc.consumable_id = c.id
		WHERE pc.property_id = $1
		ORDER BY c.category, c.name`

	rows, err := r.db.Query(ctx, query, propertyID)
	if err != nil {
		return nil, fmt.Errorf("getting property consumables: %w", err)
	}
	defer rows.Close()

	var pcs []*domain.PropertyConsumable
	for rows.Next() {
		var pc domain.PropertyConsumable
		var c domain.Consumable
		err := rows.Scan(
			&pc.ID, &pc.PropertyID, &pc.ConsumableID, &pc.Enabled, &pc.ParLevel, &pc.Notes,
			&pc.CreatedAt, &pc.UpdatedAt,
			&c.Name, &c.Category, &c.IsStandard, &c.Unit,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning property consumable: %w", err)
		}
		c.ID = pc.ConsumableID
		pc.Consumable = &c
		pcs = append(pcs, &pc)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating property consumables: %w", err)
	}
	return pcs, nil
}

// SetPropertyConsumable upserts a property consumable configuration
func (r *Repository) SetPropertyConsumable(ctx context.Context, pc *domain.PropertyConsumable) error {
	query := `
		INSERT INTO property_consumables (property_id, consumable_id, enabled, par_level, notes)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (property_id, consumable_id)
		DO UPDATE SET enabled = $3, par_level = $4, notes = $5, updated_at = now()
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		pc.PropertyID, pc.ConsumableID, pc.Enabled, pc.ParLevel, pc.Notes,
	).Scan(&pc.ID, &pc.CreatedAt, &pc.UpdatedAt)
	if err != nil {
		return fmt.Errorf("setting property consumable: %w", err)
	}
	return nil
}

// CreateJobConsumables batch inserts job consumable records
func (r *Repository) CreateJobConsumables(ctx context.Context, jobID uuid.UUID, consumables []domain.JobConsumable) error {
	if len(consumables) == 0 {
		return nil
	}

	query := `
		INSERT INTO job_consumables (job_id, consumable_id, quantity_used, quantity_remaining, needs_restock, notes)
		VALUES ($1, $2, $3, $4, $5, $6)`

	batch := &pgx.Batch{}
	for _, jc := range consumables {
		batch.Queue(query, jobID, jc.ConsumableID, jc.QuantityUsed, jc.QuantityRemaining, jc.NeedsRestock, jc.Notes)
	}

	br := r.db.SendBatch(ctx, batch)
	defer br.Close()

	for range consumables {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("creating job consumable: %w", err)
		}
	}
	return nil
}

// GetJobConsumables returns consumables used in a job
func (r *Repository) GetJobConsumables(ctx context.Context, jobID uuid.UUID) ([]*domain.JobConsumable, error) {
	query := `
		SELECT jc.id, jc.job_id, jc.consumable_id, jc.quantity_used, jc.quantity_remaining,
		       jc.needs_restock, jc.notes, jc.created_at,
		       c.name, c.category, c.unit
		FROM job_consumables jc
		JOIN consumables c ON jc.consumable_id = c.id
		WHERE jc.job_id = $1
		ORDER BY c.category, c.name`

	rows, err := r.db.Query(ctx, query, jobID)
	if err != nil {
		return nil, fmt.Errorf("getting job consumables: %w", err)
	}
	defer rows.Close()

	var jcs []*domain.JobConsumable
	for rows.Next() {
		var jc domain.JobConsumable
		var c domain.Consumable
		err := rows.Scan(
			&jc.ID, &jc.JobID, &jc.ConsumableID, &jc.QuantityUsed, &jc.QuantityRemaining,
			&jc.NeedsRestock, &jc.Notes, &jc.CreatedAt,
			&c.Name, &c.Category, &c.Unit,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning job consumable: %w", err)
		}
		c.ID = jc.ConsumableID
		jc.Consumable = &c
		jcs = append(jcs, &jc)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating job consumables: %w", err)
	}
	return jcs, nil
}
