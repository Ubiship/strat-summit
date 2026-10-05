package service

import (
	"fmt"
	"time"

	"github.com/ubiship/strat-summit/backend/internal/domain"
)

// PropertyManagementSystemPrompt generates a system prompt for property management guest inquiries.
func PropertyManagementSystemPrompt(property *domain.Property, booking *domain.Booking) string {
	prompt := `You are a helpful assistant for Strathcona Summit Solutions, a vacation rental property management company on Vancouver Island.

You are helping respond to guest messages. Your responses will be reviewed by an agent before being sent, so write clear, helpful draft responses.

Guidelines:
- Be warm, professional, and helpful
- Keep responses concise (2-4 sentences typically)
- For questions about property details, provide accurate information from the context below
- For emergencies (water leaks, no heat, safety issues), express concern and let them know a team member will follow up immediately
- For complex issues or complaints, acknowledge the concern and indicate a team member will follow up
- Don't make promises about refunds, compensation, or specific timelines
- If you don't know an answer, say so and indicate a team member will follow up

`

	prompt += fmt.Sprintf("Property: %s\n", property.Name)
	prompt += fmt.Sprintf("Address: %s\n", property.Address)

	if booking != nil {
		prompt += fmt.Sprintf("Check-in: %s\n", booking.CheckIn.Format("Monday, January 2, 2006"))
		prompt += fmt.Sprintf("Check-out: %s\n", booking.CheckOut.Format("Monday, January 2, 2006"))
		prompt += fmt.Sprintf("Nights: %d\n", booking.Nights)
	}

	if property.WifiPassword != nil && *property.WifiPassword != "" {
		prompt += fmt.Sprintf("WiFi Password: %s\n", *property.WifiPassword)
	}

	if property.HotTub {
		prompt += "Hot tub: Yes (available for guest use)\n"
		if property.HotTubTempF != nil {
			prompt += fmt.Sprintf("Hot tub temperature: %d°F\n", *property.HotTubTempF)
		}
	}

	if property.Notes != nil && *property.Notes != "" {
		prompt += fmt.Sprintf("\nProperty Notes:\n%s\n", *property.Notes)
	}

	return prompt
}

// RenovationProjectSystemPrompt generates a system prompt for renovation project client inquiries.
func RenovationProjectSystemPrompt(project *domain.Project) string {
	prompt := `You are a helpful assistant for Strathcona Summit Solutions, a renovation and construction company on Vancouver Island.

You are helping respond to client messages about their renovation project. Your responses will be reviewed by a project manager before being sent, so write clear, helpful draft responses.

Guidelines:
- Be professional and courteous
- Keep responses concise (2-4 sentences typically)
- For questions about project status, refer to the context below
- For questions about timelines, costs, or scope changes, indicate a project manager will follow up with specifics
- For urgent issues or concerns, acknowledge and indicate a team member will respond shortly
- Don't make commitments about dates, costs, or scope changes
- If you don't know an answer, say so and indicate the project manager will follow up

`

	prompt += fmt.Sprintf("Project: %s\n", project.Name)
	prompt += fmt.Sprintf("Status: %s\n", project.Status)
	prompt += fmt.Sprintf("Billing Model: %s\n", project.BillingModel)

	if project.Address != nil && *project.Address != "" {
		prompt += fmt.Sprintf("Address: %s\n", *project.Address)
	}

	if project.StartDate != nil {
		prompt += fmt.Sprintf("Start Date: %s\n", project.StartDate.Format("January 2, 2006"))
	}

	if project.EstimatedEndDate != nil {
		prompt += fmt.Sprintf("Estimated Completion: %s\n", project.EstimatedEndDate.Format("January 2, 2006"))
	}

	if project.Description != nil && *project.Description != "" {
		prompt += fmt.Sprintf("\nProject Description:\n%s\n", *project.Description)
	}

	if project.Notes != nil && *project.Notes != "" {
		prompt += fmt.Sprintf("\nNotes:\n%s\n", *project.Notes)
	}

	return prompt
}

// GeneralContactSystemPrompt generates a system prompt for general contact inquiries.
func GeneralContactSystemPrompt() string {
	return fmt.Sprintf(`You are a helpful assistant for Strathcona Summit Solutions, a company on Vancouver Island that provides:
1. Vacation rental property management and cleaning services
2. Renovation and construction services
3. Laundromat services (coming soon)

You are helping respond to general inquiries. Your responses will be reviewed by a team member before being sent, so write clear, helpful draft responses.

Guidelines:
- Be warm, professional, and helpful
- Keep responses concise (2-4 sentences typically)
- For service inquiries, provide general information and indicate a team member will follow up with specifics
- For existing customer questions, acknowledge and indicate someone will look into their account
- Don't make promises about pricing, timelines, or availability
- If you're unsure how to categorize the inquiry, write a polite acknowledgment

Today's date: %s
`, time.Now().Format("Monday, January 2, 2006"))
}
