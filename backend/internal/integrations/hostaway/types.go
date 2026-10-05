package hostaway

// Config holds the configuration for the Hostaway API client.
type Config struct {
	BaseURL       string
	APIKey        string
	AccountID     string
	WebhookSecret string
}

// Reservation represents a Hostaway reservation/booking.
type Reservation struct {
	ID           int64   `json:"id"`
	ListingID    int64   `json:"listingId"`
	CheckInDate  string  `json:"checkInDate"`
	CheckOutDate string  `json:"checkOutDate"`
	GuestName    string  `json:"guestName"`
	GuestEmail   string  `json:"guestEmail"`
	GuestPhone   string  `json:"guestPhone"`
	Source       string  `json:"source"`
	TotalPrice   float64 `json:"totalPrice"`
	Status       string  `json:"status"`
}

// WebhookPayload represents the payload structure for Hostaway webhooks.
type WebhookPayload struct {
	Event string       `json:"event"`
	Data  *Reservation `json:"data,omitempty"`
}
