package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/chatwoot"
)

// PushContactToChatwoot syncs a contact to Chatwoot and stores the returned ID.
func (s *Service) PushContactToChatwoot(ctx context.Context, contact *domain.Contact) error {
	if s.chatwoot == nil {
		return nil
	}

	cw := chatwoot.Contact{
		Name:       contact.FullName(),
		ExternalID: contact.ID.String(),
	}
	if contact.Email != nil {
		cw.Email = *contact.Email
	}
	if contact.Phone != nil {
		cw.Phone = *contact.Phone
	}

	result, err := s.chatwoot.UpsertContact(ctx, cw)
	if err != nil {
		return fmt.Errorf("upserting contact to chatwoot: %w", err)
	}

	return s.repo.SetChatwootContactID(ctx, contact.ID, result.ID)
}

// HandleContactCreatedFromChatwoot processes a contact_created webhook event.
// It tries to match by phone, then email. If no match, creates a PendingContact.
func (s *Service) HandleContactCreatedFromChatwoot(ctx context.Context, cwContact *chatwoot.Contact) error {
	// Try match by phone first
	if cwContact.Phone != "" {
		existing, err := s.repo.FindContactByPhone(ctx, cwContact.Phone)
		if err != nil {
			return fmt.Errorf("finding contact by phone: %w", err)
		}
		if existing != nil {
			return s.repo.SetChatwootContactID(ctx, existing.ID, cwContact.ID)
		}
	}

	// Try match by email
	if cwContact.Email != "" {
		existing, err := s.repo.GetContactByEmail(ctx, cwContact.Email)
		if err == nil && existing != nil {
			return s.repo.SetChatwootContactID(ctx, existing.ID, cwContact.ID)
		}
	}

	// Check if we already have a pending contact for this Chatwoot ID
	existingPending, err := s.repo.GetPendingContactByChatwootID(ctx, cwContact.ID)
	if err != nil {
		return fmt.Errorf("checking existing pending contact: %w", err)
	}
	if existingPending != nil {
		return nil // Already pending, skip
	}

	// Create pending contact for admin review
	var email, phone *string
	if cwContact.Email != "" {
		email = &cwContact.Email
	}
	if cwContact.Phone != "" {
		phone = &cwContact.Phone
	}

	pending := &domain.PendingContact{
		ChatwootContactID: cwContact.ID,
		Name:              cwContact.Name,
		Email:             email,
		Phone:             phone,
		Source:            "chatwoot",
	}

	return s.repo.CreatePendingContact(ctx, pending)
}

// HandleConversationCreated processes a conversation_created webhook event.
// Links conversation to Booking (for PM owners) or Project (for renovation clients).
func (s *Service) HandleConversationCreated(ctx context.Context, conv *chatwoot.Conversation) error {
	// Find our contact by Chatwoot contact ID
	contact, err := s.repo.FindContactByChatwootID(ctx, conv.ContactID)
	if err != nil {
		return fmt.Errorf("finding contact by chatwoot id: %w", err)
	}
	if contact == nil {
		return nil // No matching contact yet
	}

	// Route by contact role
	switch contact.Role {
	case domain.RolePMOwner:
		// Find open booking for owner's properties
		booking, err := s.repo.FindOpenBookingByOwner(ctx, contact.ID)
		if err != nil {
			return fmt.Errorf("finding open booking: %w", err)
		}
		if booking != nil {
			return s.repo.SetBookingChatwootConversation(ctx, booking.ID, conv.ID)
		}

	case domain.RoleRenovationClient:
		// Find open project for client
		project, err := s.repo.FindOpenProjectByClient(ctx, contact.ID)
		if err != nil {
			return fmt.Errorf("finding open project: %w", err)
		}
		if project != nil {
			return s.repo.SetProjectChatwootConversation(ctx, project.ID, conv.ID)
		}
	}

	return nil
}

// parseFullName splits a full name into first and last name.
func parseFullName(fullName string) (first, last string) {
	parts := strings.SplitN(strings.TrimSpace(fullName), " ", 2)
	if len(parts) >= 1 {
		first = parts[0]
	}
	if len(parts) >= 2 {
		last = parts[1]
	}
	return
}

// LogChatwootEvent logs a webhook event to the audit table.
func (s *Service) LogChatwootEvent(ctx context.Context, event *domain.ChatwootEvent) error {
	return s.repo.CreateChatwootEvent(ctx, event)
}
