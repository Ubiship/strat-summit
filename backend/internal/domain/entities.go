package domain

import (
	"time"

	"github.com/google/uuid"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleStaff    UserRole = "staff"
	RoleOwner    UserRole = "owner"
	RoleClient   UserRole = "client"
	RoleSubtrade UserRole = "subtrade"
)

// User represents an authenticated user account
type User struct {
	ID               uuid.UUID  `json:"id"`
	ContactID        uuid.UUID  `json:"contact_id"`
	Email            string     `json:"email"`
	PasswordHash     string     `json:"-"`
	Role             UserRole   `json:"role"`
	Active           bool       `json:"active"`
	RefreshTokenHash *string    `json:"-"`
	RefreshExpiresAt *time.Time `json:"-"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// Contact represents a person in the system (staff, owner, client, subtrade)
type Contact struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ServiceTier represents the level of service for a property
type ServiceTier int

const (
	TierBasicCleaning ServiceTier = 1
	TierCleaning      ServiceTier = 2
	TierFullPM        ServiceTier = 3
)

// Property represents a managed vacation rental property
type Property struct {
	ID          uuid.UUID   `json:"id"`
	Name        string      `json:"name"`
	Address     string      `json:"address"`
	Tier        ServiceTier `json:"tier"`
	OwnerID     uuid.UUID   `json:"owner_id"`
	Active      bool        `json:"active"`
	AccessCodes string      `json:"access_codes,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// Booking represents a guest booking at a property
type Booking struct {
	ID           uuid.UUID  `json:"id"`
	PropertyID   uuid.UUID  `json:"property_id"`
	Source       string     `json:"source"` // airbnb, vrbo, direct
	GuestName    string     `json:"guest_name"`
	CheckIn      time.Time  `json:"check_in"`
	CheckOut     time.Time  `json:"check_out"`
	GrossRevenue int64      `json:"gross_revenue"` // cents
	Status       string     `json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// CleaningJob represents a cleaning job for a property
type CleaningJob struct {
	ID           uuid.UUID   `json:"id"`
	PropertyID   uuid.UUID   `json:"property_id"`
	BookingID    *uuid.UUID  `json:"booking_id,omitempty"`
	ScheduledFor time.Time   `json:"scheduled_for"`
	Status       string      `json:"status"` // pending, in_progress, completed
	AssignedTo   []uuid.UUID `json:"assigned_to"`
	CompletedAt  *time.Time  `json:"completed_at,omitempty"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}
