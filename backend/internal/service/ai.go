package service

import (
	"context"
	"fmt"
	"log"

	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/anthropic"
)

// GeneratePropertyResponse generates an AI response for a property management conversation.
func (s *Service) GeneratePropertyResponse(ctx context.Context, conversationID int64, message string, booking *domain.Booking, property *domain.Property) error {
	if s.anthropic == nil {
		return nil
	}

	systemPrompt := PropertyManagementSystemPrompt(property, booking)

	messages := []anthropic.Message{
		{Role: "user", Content: message},
	}

	response, err := s.anthropic.GenerateResponse(ctx, systemPrompt, messages)
	if err != nil {
		return fmt.Errorf("generating AI response: %w", err)
	}

	// Send as private note (internal message visible only to agents)
	draftContent := fmt.Sprintf("🤖 AI Draft:\n\n%s", response)
	if err := s.chatwoot.SendPrivateNote(ctx, conversationID, draftContent); err != nil {
		return fmt.Errorf("sending private note: %w", err)
	}

	log.Printf("AI draft generated for conversation %d (property: %s)", conversationID, property.Name)
	return nil
}

// GenerateRenovationResponse generates an AI response for a renovation project conversation.
func (s *Service) GenerateRenovationResponse(ctx context.Context, conversationID int64, message string, project *domain.Project) error {
	if s.anthropic == nil {
		return nil
	}

	systemPrompt := RenovationProjectSystemPrompt(project)

	messages := []anthropic.Message{
		{Role: "user", Content: message},
	}

	response, err := s.anthropic.GenerateResponse(ctx, systemPrompt, messages)
	if err != nil {
		return fmt.Errorf("generating AI response: %w", err)
	}

	// Send as private note (internal message visible only to agents)
	draftContent := fmt.Sprintf("🤖 AI Draft:\n\n%s", response)
	if err := s.chatwoot.SendPrivateNote(ctx, conversationID, draftContent); err != nil {
		return fmt.Errorf("sending private note: %w", err)
	}

	log.Printf("AI draft generated for conversation %d (project: %s)", conversationID, project.Name)
	return nil
}

// GenerateGeneralResponse generates an AI response for a general inquiry.
func (s *Service) GenerateGeneralResponse(ctx context.Context, conversationID int64, message string) error {
	if s.anthropic == nil {
		return nil
	}

	systemPrompt := GeneralContactSystemPrompt()

	messages := []anthropic.Message{
		{Role: "user", Content: message},
	}

	response, err := s.anthropic.GenerateResponse(ctx, systemPrompt, messages)
	if err != nil {
		return fmt.Errorf("generating AI response: %w", err)
	}

	// Send as private note (internal message visible only to agents)
	draftContent := fmt.Sprintf("🤖 AI Draft:\n\n%s", response)
	if err := s.chatwoot.SendPrivateNote(ctx, conversationID, draftContent); err != nil {
		return fmt.Errorf("sending private note: %w", err)
	}

	log.Printf("AI draft generated for conversation %d (general inquiry)", conversationID)
	return nil
}
