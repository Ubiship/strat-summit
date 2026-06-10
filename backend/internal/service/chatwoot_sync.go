package service

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"
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
		last = strings.TrimSpace(parts[1])
	}
	return
}

// LogChatwootEvent logs a webhook event to the audit table.
func (s *Service) LogChatwootEvent(ctx context.Context, event *domain.ChatwootEvent) error {
	return s.repo.CreateChatwootEvent(ctx, event)
}

// ============================================================================
// Pending Contacts Admin API
// ============================================================================

// ListPendingContacts returns pending contacts awaiting admin review.
func (s *Service) ListPendingContacts(ctx context.Context, auth *domain.AuthContext, opts domain.ListOptions) ([]*domain.PendingContact, error) {
	if auth.Role != domain.RoleAdmin {
		return nil, ErrForbidden
	}
	return s.repo.ListUnreviewedPendingContacts(ctx, opts)
}

// GetPendingContact returns a single pending contact.
func (s *Service) GetPendingContact(ctx context.Context, auth *domain.AuthContext, id uuid.UUID) (*domain.PendingContact, error) {
	if auth.Role != domain.RoleAdmin {
		return nil, ErrForbidden
	}
	return s.repo.GetPendingContactByID(ctx, id)
}

// ApprovePendingContact links a pending contact to an existing contact.
func (s *Service) ApprovePendingContact(ctx context.Context, auth *domain.AuthContext, pendingID, targetContactID uuid.UUID) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	// Get the pending contact
	pending, err := s.repo.GetPendingContactByID(ctx, pendingID)
	if err != nil {
		return fmt.Errorf("getting pending contact: %w", err)
	}
	if pending.ReviewedAt != nil {
		return fmt.Errorf("pending contact already reviewed")
	}

	// Link the Chatwoot ID to the target contact
	if err := s.repo.SetChatwootContactID(ctx, targetContactID, pending.ChatwootContactID); err != nil {
		return fmt.Errorf("linking chatwoot contact: %w", err)
	}

	// Mark as reviewed
	if err := s.repo.MarkPendingContactReviewed(ctx, pendingID, auth.UserID, "merged", &targetContactID); err != nil {
		return fmt.Errorf("marking pending contact reviewed: %w", err)
	}

	return nil
}

// CreateContactFromPending creates a new contact from a pending contact.
func (s *Service) CreateContactFromPending(ctx context.Context, auth *domain.AuthContext, pendingID uuid.UUID, role domain.UserRole) (*domain.Contact, error) {
	if auth.Role != domain.RoleAdmin {
		return nil, ErrForbidden
	}

	// Get the pending contact
	pending, err := s.repo.GetPendingContactByID(ctx, pendingID)
	if err != nil {
		return nil, fmt.Errorf("getting pending contact: %w", err)
	}
	if pending.ReviewedAt != nil {
		return nil, fmt.Errorf("pending contact already reviewed")
	}

	// Parse name into first/last
	first, last := parseFullName(pending.Name)

	// Create the new contact
	contact := &domain.Contact{
		FirstName:         first,
		LastName:          last,
		Email:             pending.Email,
		Phone:             pending.Phone,
		Role:              role,
		ChatwootContactID: &pending.ChatwootContactID,
	}

	if err := s.repo.CreateContact(ctx, contact); err != nil {
		return nil, fmt.Errorf("creating contact: %w", err)
	}

	// Mark as reviewed
	if err := s.repo.MarkPendingContactReviewed(ctx, pendingID, auth.UserID, "created", &contact.ID); err != nil {
		return nil, fmt.Errorf("marking pending contact reviewed: %w", err)
	}

	// Sync to Novu (fire and forget)
	if err := s.SyncContactToNovu(ctx, contact); err != nil {
		log.Printf("novu sync failed for new contact %s: %v", contact.ID, err)
	}

	return contact, nil
}

// RejectPendingContact marks a pending contact as rejected.
func (s *Service) RejectPendingContact(ctx context.Context, auth *domain.AuthContext, pendingID uuid.UUID, reason string) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	// Get the pending contact
	pending, err := s.repo.GetPendingContactByID(ctx, pendingID)
	if err != nil {
		return fmt.Errorf("getting pending contact: %w", err)
	}
	if pending.ReviewedAt != nil {
		return fmt.Errorf("pending contact already reviewed")
	}

	// Mark as rejected
	if err := s.repo.MarkPendingContactReviewed(ctx, pendingID, auth.UserID, "rejected", nil); err != nil {
		return fmt.Errorf("marking pending contact reviewed: %w", err)
	}

	return nil
}

// ============================================================================
// Message Handling
// ============================================================================

// HandleMessageCreated processes a message_created webhook event.
func (s *Service) HandleMessageCreated(ctx context.Context, msg *chatwoot.Message, convID int64) error {
	// Skip internal notes
	if msg.Private {
		return nil
	}

	// Skip outgoing (agent) messages
	if msg.MessageType == "outgoing" {
		return nil
	}

	// Find linked booking
	booking, err := s.repo.FindBookingByChatwootConversation(ctx, convID)
	if err != nil {
		return fmt.Errorf("finding booking by conversation: %w", err)
	}
	if booking != nil {
		// TODO: Trigger notification for new message on booking
		log.Printf("new message on booking %s: %s", booking.ID, msg.Content)
		return nil
	}

	// Find linked project
	project, err := s.repo.FindProjectByChatwootConversation(ctx, convID)
	if err != nil {
		return fmt.Errorf("finding project by conversation: %w", err)
	}
	if project != nil {
		// TODO: Trigger notification for new message on project
		log.Printf("new message on project %s: %s", project.ID, msg.Content)
		return nil
	}

	// Unlinked conversation - just log
	log.Printf("message on unlinked conversation %d: %s", convID, msg.Content)
	return nil
}

// HandleConversationResolved processes a conversation_resolved webhook event.
func (s *Service) HandleConversationResolved(ctx context.Context, convID int64) error {
	// Check if linked to booking
	booking, err := s.repo.FindBookingByChatwootConversation(ctx, convID)
	if err != nil {
		return fmt.Errorf("finding booking by conversation: %w", err)
	}
	if booking != nil {
		// Append note to booking
		if err := s.repo.UpdateBookingStatus(ctx, booking.ID, "[Chatwoot conversation resolved]"); err != nil {
			return fmt.Errorf("updating booking status: %w", err)
		}
		log.Printf("conversation resolved for booking %s", booking.ID)
		return nil
	}

	// Check if linked to project
	project, err := s.repo.FindProjectByChatwootConversation(ctx, convID)
	if err != nil {
		return fmt.Errorf("finding project by conversation: %w", err)
	}
	if project != nil {
		if err := s.repo.SetProjectConversationResolved(ctx, project.ID, true); err != nil {
			return fmt.Errorf("setting project conversation resolved: %w", err)
		}
		log.Printf("conversation resolved for project %s", project.ID)
		return nil
	}

	log.Printf("conversation %d resolved (unlinked)", convID)
	return nil
}

// ============================================================================
// Contact Update Sync
// ============================================================================

// UpdateContact updates a contact and syncs to Chatwoot if linked.
func (s *Service) UpdateContact(ctx context.Context, auth *domain.AuthContext, contact *domain.Contact) error {
	if auth.Role != domain.RoleAdmin {
		return ErrForbidden
	}

	if err := s.repo.UpdateContact(ctx, contact); err != nil {
		return fmt.Errorf("updating contact: %w", err)
	}

	// Sync to Chatwoot if linked
	if contact.ChatwootContactID != nil && s.chatwoot != nil {
		if err := s.SyncContactToChatwoot(ctx, contact); err != nil {
			log.Printf("chatwoot update sync failed for contact %s: %v", contact.ID, err)
		}
	}

	return nil
}

// SyncContactToChatwoot updates a contact in Chatwoot.
func (s *Service) SyncContactToChatwoot(ctx context.Context, contact *domain.Contact) error {
	if s.chatwoot == nil {
		return nil
	}
	if contact.ChatwootContactID == nil {
		return nil
	}

	cw := chatwoot.Contact{
		ID:         *contact.ChatwootContactID,
		Name:       contact.FullName(),
		ExternalID: contact.ID.String(),
	}
	if contact.Email != nil {
		cw.Email = *contact.Email
	}
	if contact.Phone != nil {
		cw.Phone = *contact.Phone
	}

	return s.chatwoot.UpdateContact(ctx, *contact.ChatwootContactID, cw)
}

// ============================================================================
// Outbound Conversation Creation
// ============================================================================

// CreateBookingConversation creates a Chatwoot conversation for a booking.
// It upserts a contact using guest info and creates a conversation linked to the booking.
func (s *Service) CreateBookingConversation(ctx context.Context, booking *domain.Booking) error {
	if s.chatwoot == nil {
		return nil
	}

	// Need guest contact info to create conversation
	if (booking.GuestEmail == nil || *booking.GuestEmail == "") &&
		(booking.GuestPhone == nil || *booking.GuestPhone == "") {
		return nil // No contact info, can't create conversation
	}

	// Build contact from guest info
	guestName := "Guest"
	if booking.GuestName != nil && *booking.GuestName != "" {
		guestName = *booking.GuestName
	}

	cw := chatwoot.Contact{
		Name:       guestName,
		ExternalID: fmt.Sprintf("booking-%s", booking.ID.String()),
	}
	if booking.GuestEmail != nil {
		cw.Email = *booking.GuestEmail
	}
	if booking.GuestPhone != nil {
		cw.Phone = *booking.GuestPhone
	}

	// Upsert contact to get Chatwoot contact ID
	contact, err := s.chatwoot.UpsertContact(ctx, cw)
	if err != nil {
		return fmt.Errorf("upserting guest contact: %w", err)
	}

	// Create conversation with the guest contact
	conv, err := s.chatwoot.CreateConversation(ctx, contact.ID, s.cfg.ChatwootInboxID)
	if err != nil {
		return fmt.Errorf("creating conversation: %w", err)
	}

	// Link conversation to booking
	if err := s.repo.SetBookingChatwootConversation(ctx, booking.ID, conv.ID); err != nil {
		return fmt.Errorf("linking conversation to booking: %w", err)
	}

	return nil
}

// CreateProjectConversation creates a Chatwoot conversation for a project.
// It uses the project's contact to create a conversation linked to the project.
func (s *Service) CreateProjectConversation(ctx context.Context, project *domain.Project) error {
	if s.chatwoot == nil {
		return nil
	}

	// Get the project's contact
	contact, err := s.repo.GetContactByID(ctx, project.ContactID)
	if err != nil {
		return fmt.Errorf("getting project contact: %w", err)
	}
	if contact == nil {
		return nil
	}

	// If contact not linked to Chatwoot, push them first
	if contact.ChatwootContactID == nil {
		if err := s.PushContactToChatwoot(ctx, contact); err != nil {
			return fmt.Errorf("pushing contact to chatwoot: %w", err)
		}
		// Re-fetch contact to get Chatwoot ID
		contact, err = s.repo.GetContactByID(ctx, project.ContactID)
		if err != nil {
			return fmt.Errorf("re-fetching contact: %w", err)
		}
		if contact == nil || contact.ChatwootContactID == nil {
			return nil
		}
	}

	// Create conversation with the contact
	conv, err := s.chatwoot.CreateConversation(ctx, *contact.ChatwootContactID, s.cfg.ChatwootInboxID)
	if err != nil {
		return fmt.Errorf("creating conversation: %w", err)
	}

	// Link conversation to project
	if err := s.repo.SetProjectChatwootConversation(ctx, project.ID, conv.ID); err != nil {
		return fmt.Errorf("linking conversation to project: %w", err)
	}

	return nil
}
