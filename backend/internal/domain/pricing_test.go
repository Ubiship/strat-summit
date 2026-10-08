package domain

import (
	"testing"
	"time"
)

func TestGetSeason(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		expected string
	}{
		{"January is winter", time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC), "winter"},
		{"April 30 is winter", time.Date(2026, 4, 30, 23, 59, 0, 0, time.UTC), "winter"},
		{"May 1 is summer", time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC), "summer"},
		{"July is summer", time.Date(2026, 7, 15, 0, 0, 0, 0, time.UTC), "summer"},
		{"October 31 is summer", time.Date(2026, 10, 31, 23, 59, 0, 0, time.UTC), "summer"},
		{"November 1 is winter", time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC), "winter"},
		{"December is winter", time.Date(2026, 12, 25, 0, 0, 0, 0, time.UTC), "winter"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GetSeason(tt.date)
			if result != tt.expected {
				t.Errorf("GetSeason(%v) = %q, want %q", tt.date, result, tt.expected)
			}
		})
	}
}

func TestPropertyGetTurnoverRate(t *testing.T) {
	summerDate := time.Date(2026, 7, 15, 0, 0, 0, 0, time.UTC)
	winterDate := time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC)

	annualRate := 150.0
	summerRate := 175.0
	winterRate := 200.0

	tests := []struct {
		name         string
		property     Property
		date         time.Time
		expectedRate float64
		expectError  bool
	}{
		{
			name: "condo with annual rate returns annual rate in summer",
			property: Property{
				Category:           PropertyCategoryCondo,
				AssessmentComplete: true,
				TurnoverRateAnnual: &annualRate,
			},
			date:         summerDate,
			expectedRate: 150.0,
			expectError:  false,
		},
		{
			name: "condo with annual rate returns annual rate in winter",
			property: Property{
				Category:           PropertyCategoryCondo,
				AssessmentComplete: true,
				TurnoverRateAnnual: &annualRate,
			},
			date:         winterDate,
			expectedRate: 150.0,
			expectError:  false,
		},
		{
			name: "assessment property returns $55/hr regardless of category",
			property: Property{
				Category:           PropertyCategoryChalet,
				AssessmentComplete: false,
			},
			date:         summerDate,
			expectedRate: 55.0,
			expectError:  false,
		},
		{
			name: "chalet in summer returns summer rate",
			property: Property{
				Category:           PropertyCategoryChalet,
				AssessmentComplete: true,
				TurnoverRateSummer: &summerRate,
				TurnoverRateWinter: &winterRate,
			},
			date:         summerDate,
			expectedRate: 175.0,
			expectError:  false,
		},
		{
			name: "chalet in winter returns winter rate",
			property: Property{
				Category:           PropertyCategoryChalet,
				AssessmentComplete: true,
				TurnoverRateSummer: &summerRate,
				TurnoverRateWinter: &winterRate,
			},
			date:         winterDate,
			expectedRate: 200.0,
			expectError:  false,
		},
		{
			name: "alpine village in summer returns summer rate",
			property: Property{
				Category:           PropertyCategoryAlpineVillage,
				AssessmentComplete: true,
				TurnoverRateSummer: &summerRate,
				TurnoverRateWinter: &winterRate,
			},
			date:         summerDate,
			expectedRate: 175.0,
			expectError:  false,
		},
		{
			name: "alpine village in winter returns winter rate",
			property: Property{
				Category:           PropertyCategoryAlpineVillage,
				AssessmentComplete: true,
				TurnoverRateSummer: &summerRate,
				TurnoverRateWinter: &winterRate,
			},
			date:         winterDate,
			expectedRate: 200.0,
			expectError:  false,
		},
		{
			name: "condo missing annual rate returns error",
			property: Property{
				Category:           PropertyCategoryCondo,
				AssessmentComplete: true,
			},
			date:        summerDate,
			expectError: true,
		},
		{
			name: "chalet missing summer rate returns error",
			property: Property{
				Category:           PropertyCategoryChalet,
				AssessmentComplete: true,
				TurnoverRateWinter: &winterRate,
			},
			date:        summerDate,
			expectError: true,
		},
		{
			name: "chalet missing winter rate returns error",
			property: Property{
				Category:           PropertyCategoryChalet,
				AssessmentComplete: true,
				TurnoverRateSummer: &summerRate,
			},
			date:        winterDate,
			expectError: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rate, err := tt.property.GetTurnoverRate(tt.date)
			if tt.expectError {
				if err == nil {
					t.Errorf("expected error but got none")
				}
				return
			}
			if err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}
			if rate != tt.expectedRate {
				t.Errorf("GetTurnoverRate() = %v, want %v", rate, tt.expectedRate)
			}
		})
	}
}
