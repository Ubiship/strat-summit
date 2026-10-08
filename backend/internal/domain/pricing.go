package domain

import (
	"errors"
	"time"
)

// GetSeason returns "winter" for November-April, "summer" for May-October
func GetSeason(date time.Time) string {
	month := date.Month()
	if month >= time.November || month <= time.April {
		return "winter"
	}
	return "summer"
}

// GetTurnoverRate returns the applicable turnover rate for a property on a given date.
// Assessment properties return $55/hr flat.
// Condo properties use annual rate regardless of season.
// Chalet and Alpine Village properties use seasonal rates.
func (p *Property) GetTurnoverRate(date time.Time) (float64, error) {
	if !p.AssessmentComplete {
		return 55.00, nil // Assessment hourly rate
	}

	switch p.Category {
	case PropertyCategoryCondo:
		if p.TurnoverRateAnnual == nil {
			return 0, errors.New("condo missing annual rate")
		}
		return *p.TurnoverRateAnnual, nil

	case PropertyCategoryChalet, PropertyCategoryAlpineVillage:
		season := GetSeason(date)
		if season == "winter" {
			if p.TurnoverRateWinter == nil {
				return 0, errors.New("property missing winter rate")
			}
			return *p.TurnoverRateWinter, nil
		}
		if p.TurnoverRateSummer == nil {
			return 0, errors.New("property missing summer rate")
		}
		return *p.TurnoverRateSummer, nil

	default:
		return 0, errors.New("unknown property category")
	}
}
