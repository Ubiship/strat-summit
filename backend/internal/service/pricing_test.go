package service

import (
	"testing"
)

func TestCalculateCancellationFeeFromHours(t *testing.T) {
	tests := []struct {
		name         string
		hoursNotice  float64
		turnoverRate float64
		expectedFee  float64
	}{
		{"7+ days (168+ hours)", 200, 150.00, 0},
		{"exactly 168 hours", 168, 150.00, 0},
		{"167 hours (under 7 days)", 167, 150.00, 55.00},
		{"48-168 hours", 72, 150.00, 55.00},
		{"exactly 48 hours", 48, 150.00, 55.00},
		{"47 hours (under 48)", 47, 150.00, 75.00},
		{"24-48 hours", 36, 150.00, 75.00},
		{"exactly 24 hours", 24, 150.00, 75.00},
		{"23 hours (under 24)", 23, 150.00, 150.00},
		{"under 24 hours", 12, 200.00, 200.00},
		{"0 hours", 0, 175.00, 175.00},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateCancellationFeeFromHours(tt.hoursNotice, tt.turnoverRate)
			if result != tt.expectedFee {
				t.Errorf("CalculateCancellationFeeFromHours(%.2f, %.2f) = %.2f, want %.2f",
					tt.hoursNotice, tt.turnoverRate, result, tt.expectedFee)
			}
		})
	}
}
