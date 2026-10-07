package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// DuvetRotationThreshold is the number of turnovers after which duvet inserts need laundering
const DuvetRotationThreshold = 4

// CheckDuvetRotation returns alerts for any duvet inserts that have reached the rotation threshold
func (s *Service) CheckDuvetRotation(ctx context.Context, propertyID uuid.UUID) ([]*domain.LinenAlert, error) {
	linens, err := s.repo.GetPropertyLinens(ctx, propertyID)
	if err != nil {
		return nil, fmt.Errorf("getting property linens: %w", err)
	}

	var alerts []*domain.LinenAlert
	property, err := s.repo.GetPropertyByID(ctx, propertyID)
	if err != nil {
		return nil, fmt.Errorf("getting property: %w", err)
	}

	for _, linen := range linens {
		if linen.LinenType == domain.LinenTypeDuvetInsert && linen.TurnoversSinceLaunder >= DuvetRotationThreshold {
			bedSizeStr := ""
			if linen.BedSize != nil {
				bedSizeStr = string(*linen.BedSize)
			}
			locationStr := ""
			if linen.Location != nil {
				locationStr = *linen.Location
			}
			alerts = append(alerts, &domain.LinenAlert{
				LinenID:  linen.ID,
				Location: locationStr,
				Message:  fmt.Sprintf("%s: %s %s duvet needs laundry (%d turnovers)", property.Name, bedSizeStr, locationStr, linen.TurnoversSinceLaunder),
			})
		}
	}

	return alerts, nil
}

// GetAllLinenAlerts returns all duvet rotation alerts across all properties
func (s *Service) GetAllLinenAlerts(ctx context.Context) ([]*domain.LinenAlert, error) {
	return s.repo.GetLinensNeedingLaundry(ctx, DuvetRotationThreshold)
}

// RecordLinenLaunder marks a linen as laundered, resetting its turnover counter and creating a log entry
func (s *Service) RecordLinenLaunder(ctx context.Context, linenID uuid.UUID, jobID *uuid.UUID) error {
	// Reset turnovers
	if err := s.repo.ResetLinenTurnovers(ctx, linenID); err != nil {
		return fmt.Errorf("resetting linen turnovers: %w", err)
	}

	// Create rotation log entry
	log := &domain.LinenRotationLog{
		PropertyLinenID: linenID,
		JobID:           jobID,
		Action:          "laundered",
	}
	if err := s.repo.CreateLinenRotationLog(ctx, log); err != nil {
		return fmt.Errorf("creating rotation log: %w", err)
	}

	return nil
}

// RecordLinenRotation records a linen rotation event (swap with fresh linen)
func (s *Service) RecordLinenRotation(ctx context.Context, linenID uuid.UUID, jobID *uuid.UUID, notes string) error {
	log := &domain.LinenRotationLog{
		PropertyLinenID: linenID,
		JobID:           jobID,
		Action:          "rotated",
		Notes:           &notes,
	}
	if err := s.repo.CreateLinenRotationLog(ctx, log); err != nil {
		return fmt.Errorf("creating rotation log: %w", err)
	}
	return nil
}

// IncrementPropertyLinenTurnovers increments turnover count for all duvet inserts at a property
// This should be called when a cleaning job is completed
func (s *Service) IncrementPropertyLinenTurnovers(ctx context.Context, propertyID uuid.UUID) error {
	return s.repo.IncrementLinenTurnovers(ctx, propertyID)
}

// GetPropertyLinens returns all linens configured for a property
func (s *Service) GetPropertyLinens(ctx context.Context, auth *domain.AuthContext, propertyID uuid.UUID) ([]*domain.PropertyLinen, error) {
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
	case domain.RoleCleaner:
		// Cleaners can view linens for properties they have jobs at
		// For now allow read access - job assignment check could be added
	default:
		return nil, ErrForbidden
	}

	return s.repo.GetPropertyLinens(ctx, propertyID)
}

// CreatePropertyLinen adds a new linen record for a property
func (s *Service) CreatePropertyLinen(ctx context.Context, auth *domain.AuthContext, linen *domain.PropertyLinen) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.CreatePropertyLinen(ctx, linen)
}

// UpdatePropertyLinen updates a property linen record
func (s *Service) UpdatePropertyLinen(ctx context.Context, auth *domain.AuthContext, linen *domain.PropertyLinen) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.UpdatePropertyLinen(ctx, linen)
}

// DeletePropertyLinen removes a property linen record
func (s *Service) DeletePropertyLinen(ctx context.Context, auth *domain.AuthContext, linenID uuid.UUID) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.repo.DeletePropertyLinen(ctx, linenID)
}
