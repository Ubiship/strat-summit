package domain

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// Enums
// ============================================================================

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleAdmin            UserRole = "admin"
	RoleCleaner          UserRole = "cleaner"
	RoleCleaningClient   UserRole = "cleaning_client"
	RolePMOwner          UserRole = "pm_owner"
	RoleRenovationClient UserRole = "renovation_client"
	RoleSubtrade         UserRole = "subtrade"
	RoleBookkeeper       UserRole = "bookkeeper"
)

// ServiceTier represents the level of service for a property
type ServiceTier string

const (
	TierBasicCleaning ServiceTier = "1"
	TierCleaning      ServiceTier = "2"
	TierFullPM        ServiceTier = "3"
)

// IsValid checks if the service tier is a valid value
func (t ServiceTier) IsValid() bool {
	switch t {
	case TierBasicCleaning, TierCleaning, TierFullPM:
		return true
	default:
		return false
	}
}

// BookingSource represents where a booking originated
type BookingSource string

const (
	BookingSourceAirbnb   BookingSource = "airbnb"
	BookingSourceVRBO     BookingSource = "vrbo"
	BookingSourceDirect   BookingSource = "direct"
	BookingSourceOwnerUse BookingSource = "owner_use"
	BookingSourcePlatform BookingSource = "platform"
)

// IsValid checks if the booking source is a valid value
func (s BookingSource) IsValid() bool {
	switch s {
	case BookingSourceAirbnb, BookingSourceVRBO, BookingSourceDirect, BookingSourceOwnerUse, BookingSourcePlatform:
		return true
	default:
		return false
	}
}

// TaxTreatment represents how taxes are handled for a booking
type TaxTreatment string

const (
	TaxTreatmentAirbnbManaged TaxTreatment = "airbnb_managed"
	TaxTreatmentDirect        TaxTreatment = "direct"
	TaxTreatmentNone          TaxTreatment = "none"
)

// JobStatus represents the status of a cleaning job
type JobStatus string

const (
	JobStatusAssigned   JobStatus = "assigned"
	JobStatusInProgress JobStatus = "in_progress"
	JobStatusComplete   JobStatus = "complete"
	JobStatusFlagged    JobStatus = "flagged"
)

// IsValid checks if the job status is a valid value
func (s JobStatus) IsValid() bool {
	switch s {
	case JobStatusAssigned, JobStatusInProgress, JobStatusComplete, JobStatusFlagged:
		return true
	default:
		return false
	}
}

// CompModel represents the compensation model for cleaners
type CompModel string

const (
	CompModelHourly CompModel = "hourly"
	CompModelPerJob CompModel = "per_job"
)

// StatementStatus represents the status of an owner statement
type StatementStatus string

const (
	StatementStatusDraft StatementStatus = "draft"
	StatementStatusSent  StatementStatus = "sent"
	StatementStatusPaid  StatementStatus = "paid"
)

// ProjectStatus represents the status of a renovation project
type ProjectStatus string

const (
	ProjectStatusEstimate   ProjectStatus = "estimate"
	ProjectStatusBooked     ProjectStatus = "booked"
	ProjectStatusInProgress ProjectStatus = "in_progress"
	ProjectStatusComplete   ProjectStatus = "complete"
	ProjectStatusCancelled  ProjectStatus = "cancelled"
)

// BillingModel represents the billing model for a renovation project
type BillingModel string

const (
	BillingModelFixed    BillingModel = "fixed"
	BillingModelCostPlus BillingModel = "cost_plus"
	BillingModelTAndM    BillingModel = "t_and_m"
)

// PhotoVisibility represents who can see a photo
type PhotoVisibility string

const (
	PhotoVisibilityInternal PhotoVisibility = "internal"
	PhotoVisibilityOwner    PhotoVisibility = "owner"
	PhotoVisibilityPublic   PhotoVisibility = "public"
)

// ServiceLineType represents the type of service line
type ServiceLineType string

const (
	ServiceLineTypeCleaning    ServiceLineType = "cleaning"
	ServiceLineTypeLaundry     ServiceLineType = "laundry"
	ServiceLineTypeShoveling   ServiceLineType = "shoveling"
	ServiceLineTypeMaintenance ServiceLineType = "maintenance"
	ServiceLineTypePurchase    ServiceLineType = "purchase"
	ServiceLineTypeRestock     ServiceLineType = "restock"
)

// TaxType represents the tax treatment for a service line
type TaxType string

const (
	TaxTypeGSTOnly    TaxType = "gst_only"
	TaxTypeGSTPST     TaxType = "gst_pst"
	TaxTypeGSTPSTMRDT TaxType = "gst_pst_mrdt"
	TaxTypeNone       TaxType = "none"
)

// AgreementType represents the type of service agreement
type AgreementType string

const (
	AgreementTypeCleaning          AgreementType = "cleaning"
	AgreementTypePM                AgreementType = "pm"
	AgreementTypeRenovationFixed   AgreementType = "renovation_fixed"
	AgreementTypeRenovationCostPlus AgreementType = "renovation_cost_plus"
	AgreementTypeRenovationTAndM   AgreementType = "renovation_t_and_m"
)

// ChangeOrderStatus represents the status of a change order
type ChangeOrderStatus string

const (
	ChangeOrderStatusPending  ChangeOrderStatus = "pending"
	ChangeOrderStatusApproved ChangeOrderStatus = "approved"
	ChangeOrderStatusRejected ChangeOrderStatus = "rejected"
)

// ============================================================================
// Auth Context
// ============================================================================

// AuthContext holds authenticated user context for service-layer access control
type AuthContext struct {
	UserID    uuid.UUID
	ContactID uuid.UUID
	Role      UserRole
}

// ============================================================================
// Core / Shared Entities
// ============================================================================

// Contact represents a person in the system (staff, owners, clients, subtrades)
type Contact struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	FirstName        string     `json:"first_name" db:"first_name"`
	LastName         string     `json:"last_name" db:"last_name"`
	Email            *string    `json:"email,omitempty" db:"email"`
	Phone            *string    `json:"phone,omitempty" db:"phone"`
	CompanyName      *string    `json:"company_name,omitempty" db:"company_name"`
	Role             UserRole   `json:"role" db:"role"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	ChatwootContactID *int64    `json:"chatwoot_contact_id,omitempty" db:"chatwoot_contact_id"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`
}

// FullName returns the contact's full name
func (c *Contact) FullName() string {
	return c.FirstName + " " + c.LastName
}

// User represents an authenticated user account
type User struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	ContactID             uuid.UUID  `json:"contact_id" db:"contact_id"`
	Email                 string     `json:"email" db:"email"`
	PasswordHash          string     `json:"-" db:"password_hash"`
	Role                  UserRole   `json:"role" db:"role"`
	RefreshTokenHash      *string    `json:"-" db:"refresh_token_hash"`
	RefreshTokenExpiresAt *time.Time `json:"-" db:"refresh_token_expires_at"`
	LastLoginAt           *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`
	Active                bool       `json:"active" db:"active"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields (not always populated)
	Contact *Contact `json:"contact,omitempty" db:"-"`
}

// ============================================================================
// Property Management Domain
// ============================================================================

// JSONB is a helper type for JSONB columns
type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(b, j)
}

// ChecklistTemplate represents a cleaning checklist template
type ChecklistTemplate struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Rooms     JSONB     `json:"rooms" db:"rooms"`
	Version   int       `json:"version" db:"version"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// Property represents a managed vacation rental property
type Property struct {
	ID                        uuid.UUID    `json:"id" db:"id"`
	Name                      string       `json:"name" db:"name"`
	Address                   string       `json:"address" db:"address"`
	Tier                      ServiceTier  `json:"tier" db:"tier"`
	CommissionRate            float64      `json:"commission_rate" db:"commission_rate"`
	CleaningFee               float64      `json:"cleaning_fee" db:"cleaning_fee"`
	CleaningFeeCommissionable bool         `json:"cleaning_fee_commissionable" db:"cleaning_fee_commissionable"`
	AirbnbIcalURL             *string      `json:"airbnb_ical_url,omitempty" db:"airbnb_ical_url"`
	VRBOIcalURL               *string      `json:"vrbo_ical_url,omitempty" db:"vrbo_ical_url"`
	WifiPassword              *string      `json:"wifi_password,omitempty" db:"wifi_password"`
	AccessCodes               JSONB        `json:"access_codes,omitempty" db:"access_codes"`
	HotTub                    bool         `json:"hot_tub" db:"hot_tub"`
	HotTubTempF               *int         `json:"hot_tub_temp_f,omitempty" db:"hot_tub_temp_f"`
	Notes                     *string      `json:"notes,omitempty" db:"notes"`
	SupplyList                JSONB        `json:"supply_list,omitempty" db:"supply_list"`
	ChecklistTemplateID       *uuid.UUID   `json:"checklist_template_id,omitempty" db:"checklist_template_id"`
	Active                    bool         `json:"active" db:"active"`
	CreatedAt                 time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt                 time.Time    `json:"updated_at" db:"updated_at"`

	// Joined fields
	Owners []*PropertyOwner `json:"owners,omitempty" db:"-"`
}

// PropertyOwner represents an owner of a property (supports co-ownership)
type PropertyOwner struct {
	ID             uuid.UUID `json:"id" db:"id"`
	PropertyID     uuid.UUID `json:"property_id" db:"property_id"`
	ContactID      uuid.UUID `json:"contact_id" db:"contact_id"`
	EquityShare    float64   `json:"equity_share" db:"equity_share"`
	PortalAccess   bool      `json:"portal_access" db:"portal_access"`
	StatementEmail *string   `json:"statement_email,omitempty" db:"statement_email"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	Contact *Contact `json:"contact,omitempty" db:"-"`
}

// Booking represents a guest reservation
type Booking struct {
	ID                      uuid.UUID     `json:"id" db:"id"`
	PropertyID              uuid.UUID     `json:"property_id" db:"property_id"`
	Source                  BookingSource `json:"source" db:"source"`
	TaxTreatment            TaxTreatment  `json:"tax_treatment" db:"tax_treatment"`
	ExternalUID             *string       `json:"external_uid,omitempty" db:"external_uid"`
	GuestName               *string       `json:"guest_name,omitempty" db:"guest_name"`
	GuestEmail              *string       `json:"guest_email,omitempty" db:"guest_email"`
	GuestPhone              *string       `json:"guest_phone,omitempty" db:"guest_phone"`
	CheckIn                 time.Time     `json:"check_in" db:"check_in"`
	CheckOut                time.Time     `json:"check_out" db:"check_out"`
	Nights                  int           `json:"nights" db:"nights"`
	NightlyRate             *float64      `json:"nightly_rate,omitempty" db:"nightly_rate"`
	NightlyRateWeekend      *float64      `json:"nightly_rate_weekend,omitempty" db:"nightly_rate_weekend"`
	NightlyRateHoliday      *float64      `json:"nightly_rate_holiday,omitempty" db:"nightly_rate_holiday"`
	RevenueInclCleaningFee  *float64      `json:"revenue_incl_cleaning_fee,omitempty" db:"revenue_incl_cleaning_fee"`
	RevenueExclCleaningFee  *float64      `json:"revenue_excl_cleaning_fee,omitempty" db:"revenue_excl_cleaning_fee"`
	CleaningFeeCharged      *float64      `json:"cleaning_fee_charged,omitempty" db:"cleaning_fee_charged"`
	GST                     float64       `json:"gst" db:"gst"`
	PST                     float64       `json:"pst" db:"pst"`
	MRDT                    float64       `json:"mrdt" db:"mrdt"`
	Notes                   *string       `json:"notes,omitempty" db:"notes"`
	CleaningJobID           *uuid.UUID    `json:"cleaning_job_id,omitempty" db:"cleaning_job_id"`
	StatementID             *uuid.UUID    `json:"statement_id,omitempty" db:"statement_id"`
	ChatwootConversationID  *int64        `json:"chatwoot_conversation_id,omitempty" db:"chatwoot_conversation_id"`
	CreatedAt               time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt               time.Time     `json:"updated_at" db:"updated_at"`

	// Joined fields
	Property    *Property    `json:"property,omitempty" db:"-"`
	CleaningJob *CleaningJob `json:"cleaning_job,omitempty" db:"-"`
}

// CleaningJob represents a cleaning assignment
type CleaningJob struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	PropertyID            uuid.UUID  `json:"property_id" db:"property_id"`
	BookingID             *uuid.UUID `json:"booking_id,omitempty" db:"booking_id"`
	ScheduledDate         time.Time  `json:"scheduled_date" db:"scheduled_date"`
	ScheduledTime         *string    `json:"scheduled_time,omitempty" db:"scheduled_time"`
	Status                JobStatus  `json:"status" db:"status"`
	CompModel             CompModel  `json:"comp_model" db:"comp_model"`
	JobRate               *float64   `json:"job_rate,omitempty" db:"job_rate"`
	DurationHours         *float64   `json:"duration_hours,omitempty" db:"duration_hours"`
	ArrivedAt             *time.Time `json:"arrived_at,omitempty" db:"arrived_at"`
	CompletedAt           *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	ChecklistData         JSONB      `json:"checklist_data,omitempty" db:"checklist_data"`
	ChecklistCompletionPct int       `json:"checklist_completion_pct" db:"checklist_completion_pct"`
	HotTubPhotoRequired   *bool      `json:"hot_tub_photo_required,omitempty" db:"hot_tub_photo_required"`
	HotTubStatus          *string    `json:"hot_tub_status,omitempty" db:"hot_tub_status"`
	DamageNotes           *string    `json:"damage_notes,omitempty" db:"damage_notes"`
	RestockNotes          *string    `json:"restock_notes,omitempty" db:"restock_notes"`
	InternalNotes         *string    `json:"internal_notes,omitempty" db:"internal_notes"`
	DispatchedAt          *time.Time `json:"dispatched_at,omitempty" db:"dispatched_at"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	Property *Property           `json:"property,omitempty" db:"-"`
	Booking  *Booking            `json:"booking,omitempty" db:"-"`
	Staff    []*CleaningJobStaff `json:"staff,omitempty" db:"-"`
}

// CleaningJobStaff represents a cleaner assigned to a job
type CleaningJobStaff struct {
	ID          uuid.UUID `json:"id" db:"id"`
	JobID       uuid.UUID `json:"job_id" db:"job_id"`
	ContactID   uuid.UUID `json:"contact_id" db:"contact_id"`
	HoursLogged *float64  `json:"hours_logged,omitempty" db:"hours_logged"`
	HourlyRate  *float64  `json:"hourly_rate,omitempty" db:"hourly_rate"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	Contact *Contact `json:"contact,omitempty" db:"-"`
}

// ServiceAgreement represents a service contract with a property owner
type ServiceAgreement struct {
	ID             uuid.UUID     `json:"id" db:"id"`
	PropertyID     uuid.UUID     `json:"property_id" db:"property_id"`
	ContactID      uuid.UUID     `json:"contact_id" db:"contact_id"`
	Tier           ServiceTier   `json:"tier" db:"tier"`
	Type           AgreementType `json:"type" db:"type"`
	MonthlyRate    *float64      `json:"monthly_rate,omitempty" db:"monthly_rate"`
	CommissionRate *float64      `json:"commission_rate,omitempty" db:"commission_rate"`
	EffectiveDate  time.Time     `json:"effective_date" db:"effective_date"`
	ExpiryDate     *time.Time    `json:"expiry_date,omitempty" db:"expiry_date"`
	DropboxSignID  *string       `json:"dropbox_sign_id,omitempty" db:"dropbox_sign_id"`
	SignedAt       *time.Time    `json:"signed_at,omitempty" db:"signed_at"`
	DocumentKey    *string       `json:"document_key,omitempty" db:"document_key"`
	Status         string        `json:"status" db:"status"`
	CreatedAt      time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at" db:"updated_at"`

	// Joined fields
	Property *Property `json:"property,omitempty" db:"-"`
	Contact  *Contact  `json:"contact,omitempty" db:"-"`
}

// OwnerStatement represents a monthly payout statement for Tier 3 properties
type OwnerStatement struct {
	ID                    uuid.UUID       `json:"id" db:"id"`
	PropertyID            uuid.UUID       `json:"property_id" db:"property_id"`
	PropertyOwnerID       uuid.UUID       `json:"property_owner_id" db:"property_owner_id"`
	PeriodStart           time.Time       `json:"period_start" db:"period_start"`
	PeriodEnd             time.Time       `json:"period_end" db:"period_end"`
	TotalRevenueInclFee   *float64        `json:"total_revenue_incl_fee,omitempty" db:"total_revenue_incl_fee"`
	TotalRevenueExclFee   *float64        `json:"total_revenue_excl_fee,omitempty" db:"total_revenue_excl_fee"`
	CommissionRate        *float64        `json:"commission_rate,omitempty" db:"commission_rate"`
	CommissionTotal       *float64        `json:"commission_total,omitempty" db:"commission_total"`
	GSTCollected          *float64        `json:"gst_collected,omitempty" db:"gst_collected"`
	PSTCollected          *float64        `json:"pst_collected,omitempty" db:"pst_collected"`
	MRDTCollected         *float64        `json:"mrdt_collected,omitempty" db:"mrdt_collected"`
	ExpensesCleaning      *float64        `json:"expenses_cleaning,omitempty" db:"expenses_cleaning"`
	ExpensesLaundry       *float64        `json:"expenses_laundry,omitempty" db:"expenses_laundry"`
	ExpensesShoveling     *float64        `json:"expenses_shoveling,omitempty" db:"expenses_shoveling"`
	ExpensesMaintenance   *float64        `json:"expenses_maintenance,omitempty" db:"expenses_maintenance"`
	ExpensesPurchases     *float64        `json:"expenses_purchases,omitempty" db:"expenses_purchases"`
	ExpensesTotal         *float64        `json:"expenses_total,omitempty" db:"expenses_total"`
	OwnerPayoutNet        *float64        `json:"owner_payout_net,omitempty" db:"owner_payout_net"`
	Status                StatementStatus `json:"status" db:"status"`
	PDFKey                *string         `json:"pdf_key,omitempty" db:"pdf_key"`
	SentAt                *time.Time      `json:"sent_at,omitempty" db:"sent_at"`
	QBOInvoiceID          *string         `json:"qbo_invoice_id,omitempty" db:"qbo_invoice_id"`
	CreatedAt             time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time       `json:"updated_at" db:"updated_at"`
}

// ServiceLine represents a billable line item on the internal breakdown
type ServiceLine struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	PropertyID  uuid.UUID       `json:"property_id" db:"property_id"`
	BookingID   *uuid.UUID      `json:"booking_id,omitempty" db:"booking_id"`
	StatementID *uuid.UUID      `json:"statement_id,omitempty" db:"statement_id"`
	Type        ServiceLineType `json:"type" db:"type"`
	Date        time.Time       `json:"date" db:"date"`
	Description *string         `json:"description,omitempty" db:"description"`
	Quantity    float64         `json:"quantity" db:"quantity"`
	Rate        float64         `json:"rate" db:"rate"`
	MarkupRate  float64         `json:"markup_rate" db:"markup_rate"`
	Subtotal    float64         `json:"subtotal" db:"subtotal"` // Generated column
	TaxType     TaxType         `json:"tax_type" db:"tax_type"`
	GST         float64         `json:"gst" db:"gst"`     // Generated column
	PST         float64         `json:"pst" db:"pst"`     // Generated column
	Total       float64         `json:"total" db:"total"` // Generated column
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`

	// Joined fields
	Property *Property `json:"property,omitempty" db:"-"`
	Booking  *Booking  `json:"booking,omitempty" db:"-"`
}

// Photo represents a photo attached to a job or project
type Photo struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	JobID       *uuid.UUID      `json:"job_id,omitempty" db:"job_id"`
	ProjectID   *uuid.UUID      `json:"project_id,omitempty" db:"project_id"`
	UploadedBy  uuid.UUID       `json:"uploaded_by" db:"uploaded_by"`
	Bucket      string          `json:"bucket" db:"bucket"`
	StorageKey  string          `json:"storage_key" db:"storage_key"`
	ContentType string          `json:"content_type" db:"content_type"`
	SizeBytes   *int64          `json:"size_bytes,omitempty" db:"size_bytes"`
	Visibility  PhotoVisibility `json:"visibility" db:"visibility"`
	Room        *string         `json:"room,omitempty" db:"room"`
	Caption     *string         `json:"caption,omitempty" db:"caption"`
	TakenAt     *time.Time      `json:"taken_at,omitempty" db:"taken_at"`
	IsRequired  bool            `json:"is_required" db:"is_required"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

// ============================================================================
// Renovations Domain
// ============================================================================

// Project represents a renovation project
type Project struct {
	ID                     uuid.UUID     `json:"id" db:"id"`
	ContactID              uuid.UUID     `json:"contact_id" db:"contact_id"`
	Name                   string        `json:"name" db:"name"`
	Address                *string       `json:"address,omitempty" db:"address"`
	Status                 ProjectStatus `json:"status" db:"status"`
	BillingModel           BillingModel  `json:"billing_model" db:"billing_model"`
	Description            *string       `json:"description,omitempty" db:"description"`
	StartDate              *time.Time    `json:"start_date,omitempty" db:"start_date"`
	EstimatedEndDate       *time.Time    `json:"estimated_end_date,omitempty" db:"estimated_end_date"`
	ActualEndDate          *time.Time    `json:"actual_end_date,omitempty" db:"actual_end_date"`
	DepositPct             *float64      `json:"deposit_pct,omitempty" db:"deposit_pct"`
	DepositAmount          *float64      `json:"deposit_amount,omitempty" db:"deposit_amount"`
	DepositPaidAt          *time.Time    `json:"deposit_paid_at,omitempty" db:"deposit_paid_at"`
	TotalEstimate          *float64      `json:"total_estimate,omitempty" db:"total_estimate"`
	TotalInvoiced          *float64      `json:"total_invoiced,omitempty" db:"total_invoiced"`
	TotalPaid              *float64      `json:"total_paid,omitempty" db:"total_paid"`
	MarginTargetPct        *float64      `json:"margin_target_pct,omitempty" db:"margin_target_pct"`
	Notes                  *string       `json:"notes,omitempty" db:"notes"`
	ChatwootConversationID *int64        `json:"chatwoot_conversation_id,omitempty" db:"chatwoot_conversation_id"`
	CreatedAt              time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time     `json:"updated_at" db:"updated_at"`

	// Joined fields
	Client *Contact `json:"client,omitempty" db:"-"`
}

// Subtrade represents a subcontractor
type Subtrade struct {
	ID                 uuid.UUID  `json:"id" db:"id"`
	ContactID          uuid.UUID  `json:"contact_id" db:"contact_id"`
	TradeType          string     `json:"trade_type" db:"trade_type"`
	InsuranceProvider  *string    `json:"insurance_provider,omitempty" db:"insurance_provider"`
	InsurancePolicyNum *string    `json:"insurance_policy_num,omitempty" db:"insurance_policy_num"`
	InsuranceExpiry    *time.Time `json:"insurance_expiry,omitempty" db:"insurance_expiry"`
	DefaultRate        *float64   `json:"default_rate,omitempty" db:"default_rate"`
	Notes              *string    `json:"notes,omitempty" db:"notes"`
	Active             bool       `json:"active" db:"active"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	Contact *Contact `json:"contact,omitempty" db:"-"`
}

// Estimate represents a project cost estimate
type Estimate struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	ProjectID         uuid.UUID  `json:"project_id" db:"project_id"`
	Version           int        `json:"version" db:"version"`
	Status            string     `json:"status" db:"status"`
	ValidUntil        *time.Time `json:"valid_until,omitempty" db:"valid_until"`
	SubtotalMaterials *float64   `json:"subtotal_materials,omitempty" db:"subtotal_materials"`
	SubtotalLabour    *float64   `json:"subtotal_labour,omitempty" db:"subtotal_labour"`
	MarginAmount      *float64   `json:"margin_amount,omitempty" db:"margin_amount"`
	GST               *float64   `json:"gst,omitempty" db:"gst"`
	Total             *float64   `json:"total,omitempty" db:"total"`
	Notes             *string    `json:"notes,omitempty" db:"notes"`
	InternalNotes     *string    `json:"internal_notes,omitempty" db:"internal_notes"`
	DropboxSignID     *string    `json:"dropbox_sign_id,omitempty" db:"dropbox_sign_id"`
	SignedAt          *time.Time `json:"signed_at,omitempty" db:"signed_at"`
	QBOEstimateID     *string    `json:"qbo_estimate_id,omitempty" db:"qbo_estimate_id"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	LineItems []*EstimateLineItem `json:"line_items,omitempty" db:"-"`
}

// EstimateLineItem represents a line item on an estimate
type EstimateLineItem struct {
	ID          uuid.UUID `json:"id" db:"id"`
	EstimateID  uuid.UUID `json:"estimate_id" db:"estimate_id"`
	Type        string    `json:"type" db:"type"`
	Description string    `json:"description" db:"description"`
	Quantity    float64   `json:"quantity" db:"quantity"`
	Unit        *string   `json:"unit,omitempty" db:"unit"`
	UnitCost    float64   `json:"unit_cost" db:"unit_cost"`
	MarginPct   float64   `json:"margin_pct" db:"margin_pct"`
	Subtotal    float64   `json:"subtotal" db:"subtotal"`
	Supplier    *string   `json:"supplier,omitempty" db:"supplier"`
	Notes       *string   `json:"notes,omitempty" db:"notes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// ============================================================================
// Scheduling Domain
// ============================================================================

// Consultation represents a Cal.com booking
type Consultation struct {
	ID                     uuid.UUID  `json:"id" db:"id"`
	ContactID              uuid.UUID  `json:"contact_id" db:"contact_id"`
	ProjectID              *uuid.UUID `json:"project_id,omitempty" db:"project_id"`
	CalBookingUID          string     `json:"cal_booking_uid" db:"cal_booking_uid"`
	EventType              string     `json:"event_type" db:"event_type"`
	StartTime              time.Time  `json:"start_time" db:"start_time"`
	EndTime                time.Time  `json:"end_time" db:"end_time"`
	Status                 string     `json:"status" db:"status"`
	Notes                  *string    `json:"notes,omitempty" db:"notes"`
	ChatwootConversationID *int64     `json:"chatwoot_conversation_id,omitempty" db:"chatwoot_conversation_id"`
	Outcome                *string    `json:"outcome,omitempty" db:"outcome"`
	ProjectCreated         bool       `json:"project_created" db:"project_created"`
	CreatedAt              time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at" db:"updated_at"`
}

// ============================================================================
// List Options
// ============================================================================

// ListOptions provides common pagination and filtering options
type ListOptions struct {
	Limit  int
	Offset int
}
