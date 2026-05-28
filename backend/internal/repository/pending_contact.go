package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// CreatePendingContact inserts a new pending contact for admin review.
func (r *Repository) CreatePendingContact(ctx context.Context, pc *domain.PendingContact) error {
	query := `
		INSERT INTO pending_contacts (chatwoot_contact_id, name, email, phone, source)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`

	err := r.db.QueryRow(ctx, query,
		pc.ChatwootContactID, pc.Name, pc.Email, pc.Phone, pc.Source,
	).Scan(&pc.ID, &pc.CreatedAt)
	if err != nil {
		return fmt.Errorf("creating pending contact: %w", err)
	}
	return nil
}

// GetPendingContactByID retrieves a pending contact by ID.
func (r *Repository) GetPendingContactByID(ctx context.Context, id uuid.UUID) (*domain.PendingContact, error) {
	query := `
		SELECT id, chatwoot_contact_id, name, email, phone, source,
		       created_at, reviewed_at, reviewed_by, action, merged_with_id
		FROM pending_contacts
		WHERE id = $1`

	var pc domain.PendingContact
	err := r.db.QueryRow(ctx, query, id).Scan(
		&pc.ID, &pc.ChatwootContactID, &pc.Name, &pc.Email, &pc.Phone, &pc.Source,
		&pc.CreatedAt, &pc.ReviewedAt, &pc.ReviewedBy, &pc.Action, &pc.MergedWithID,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying pending contact: %w", err)
	}
	return &pc, nil
}

// ListUnreviewedPendingContacts returns all pending contacts not yet reviewed.
func (r *Repository) ListUnreviewedPendingContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.PendingContact, error) {
	query := `
		SELECT id, chatwoot_contact_id, name, email, phone, source,
		       created_at, reviewed_at, reviewed_by, action, merged_with_id
		FROM pending_contacts
		WHERE reviewed_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.db.Query(ctx, query, limit, opts.Offset)
	if err != nil {
		return nil, fmt.Errorf("listing unreviewed pending contacts: %w", err)
	}
	defer rows.Close()

	var contacts []*domain.PendingContact
	for rows.Next() {
		var pc domain.PendingContact
		err := rows.Scan(
			&pc.ID, &pc.ChatwootContactID, &pc.Name, &pc.Email, &pc.Phone, &pc.Source,
			&pc.CreatedAt, &pc.ReviewedAt, &pc.ReviewedBy, &pc.Action, &pc.MergedWithID,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning pending contact: %w", err)
		}
		contacts = append(contacts, &pc)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating pending contacts: %w", err)
	}
	return contacts, nil
}

// MarkPendingContactReviewed marks a pending contact as reviewed with the given action.
func (r *Repository) MarkPendingContactReviewed(ctx context.Context, id uuid.UUID, reviewerID uuid.UUID, action string, mergedWithID *uuid.UUID) error {
	query := `
		UPDATE pending_contacts
		SET reviewed_at = NOW(), reviewed_by = $2, action = $3, merged_with_id = $4
		WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id, reviewerID, action, mergedWithID)
	if err != nil {
		return fmt.Errorf("marking pending contact reviewed: %w", err)
	}
	return nil
}

// GetPendingContactByChatwootID checks if a pending contact already exists for a Chatwoot contact.
func (r *Repository) GetPendingContactByChatwootID(ctx context.Context, chatwootID int64) (*domain.PendingContact, error) {
	query := `
		SELECT id, chatwoot_contact_id, name, email, phone, source,
		       created_at, reviewed_at, reviewed_by, action, merged_with_id
		FROM pending_contacts
		WHERE chatwoot_contact_id = $1 AND reviewed_at IS NULL`

	var pc domain.PendingContact
	err := r.db.QueryRow(ctx, query, chatwootID).Scan(
		&pc.ID, &pc.ChatwootContactID, &pc.Name, &pc.Email, &pc.Phone, &pc.Source,
		&pc.CreatedAt, &pc.ReviewedAt, &pc.ReviewedBy, &pc.Action, &pc.MergedWithID,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("querying pending contact by chatwoot id: %w", err)
	}
	return &pc, nil
}
