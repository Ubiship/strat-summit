package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ubiship/strat-summit/backend/internal/domain"
)

var (
	ErrNotFound      = errors.New("not found")
	ErrAlreadyExists = errors.New("already exists")
)

// Repository provides data access methods
type Repository struct {
	db *pgxpool.Pool
}

// New creates a new Repository instance
func New(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// DB returns the underlying database pool (for transactions)
func (r *Repository) DB() *pgxpool.Pool {
	return r.db
}

// ============================================================================
// User Repository
// ============================================================================

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, contact_id, email, password_hash, role,
			   refresh_token_hash, refresh_token_expires_at, last_login_at,
			   active, created_at, updated_at
		FROM users
		WHERE email = $1`

	var u domain.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.ContactID, &u.Email, &u.PasswordHash, &u.Role,
		&u.RefreshTokenHash, &u.RefreshTokenExpiresAt, &u.LastLoginAt,
		&u.Active, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying user by email: %w", err)
	}
	return &u, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, contact_id, email, password_hash, role,
			   refresh_token_hash, refresh_token_expires_at, last_login_at,
			   active, created_at, updated_at
		FROM users
		WHERE id = $1`

	var u domain.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.ContactID, &u.Email, &u.PasswordHash, &u.Role,
		&u.RefreshTokenHash, &u.RefreshTokenExpiresAt, &u.LastLoginAt,
		&u.Active, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying user by id: %w", err)
	}
	return &u, nil
}

func (r *Repository) CreateUser(ctx context.Context, u *domain.User) error {
	query := `
		INSERT INTO users (contact_id, email, password_hash, role, active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		u.ContactID, u.Email, u.PasswordHash, u.Role, u.Active,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating user: %w", err)
	}
	return nil
}

func (r *Repository) UpdateRefreshToken(ctx context.Context, userID uuid.UUID, hash *string, expiresAt *time.Time) error {
	query := `
		UPDATE users
		SET refresh_token_hash = $2, refresh_token_expires_at = $3, updated_at = now()
		WHERE id = $1`

	_, err := r.db.Exec(ctx, query, userID, hash, expiresAt)
	if err != nil {
		return fmt.Errorf("updating refresh token: %w", err)
	}
	return nil
}

func (r *Repository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("updating last login: %w", err)
	}
	return nil
}

// ============================================================================
// Contact Repository
// ============================================================================

func (r *Repository) CreateContact(ctx context.Context, c *domain.Contact) error {
	query := `
		INSERT INTO contacts (first_name, last_name, email, phone, company_name, role, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		c.FirstName, c.LastName, c.Email, c.Phone, c.CompanyName, c.Role, c.Notes,
	).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating contact: %w", err)
	}
	return nil
}

func (r *Repository) GetContactByID(ctx context.Context, id uuid.UUID) (*domain.Contact, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, company_name, role, notes,
			   chatwoot_contact_id, created_at, updated_at
		FROM contacts
		WHERE id = $1`

	var c domain.Contact
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.FirstName, &c.LastName, &c.Email, &c.Phone, &c.CompanyName,
		&c.Role, &c.Notes, &c.ChatwootContactID, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying contact by id: %w", err)
	}
	return &c, nil
}

func (r *Repository) GetContactByEmail(ctx context.Context, email string) (*domain.Contact, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, company_name, role, notes,
			   chatwoot_contact_id, created_at, updated_at
		FROM contacts
		WHERE email = $1`

	var c domain.Contact
	err := r.db.QueryRow(ctx, query, email).Scan(
		&c.ID, &c.FirstName, &c.LastName, &c.Email, &c.Phone, &c.CompanyName,
		&c.Role, &c.Notes, &c.ChatwootContactID, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying contact by email: %w", err)
	}
	return &c, nil
}

func (r *Repository) ListContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.Contact, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, company_name, role, notes,
			   chatwoot_contact_id, created_at, updated_at
		FROM contacts
		ORDER BY last_name, first_name
		LIMIT $1 OFFSET $2`

	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.db.Query(ctx, query, limit, opts.Offset)
	if err != nil {
		return nil, fmt.Errorf("listing contacts: %w", err)
	}
	defer rows.Close()

	var contacts []*domain.Contact
	for rows.Next() {
		var c domain.Contact
		err := rows.Scan(
			&c.ID, &c.FirstName, &c.LastName, &c.Email, &c.Phone, &c.CompanyName,
			&c.Role, &c.Notes, &c.ChatwootContactID, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning contact: %w", err)
		}
		contacts = append(contacts, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating contacts: %w", err)
	}
	return contacts, nil
}

func (r *Repository) ListContactsByRole(ctx context.Context, role domain.UserRole, opts domain.ListOptions) ([]*domain.Contact, error) {
	query := `
		SELECT id, first_name, last_name, email, phone, company_name, role, notes,
			   chatwoot_contact_id, created_at, updated_at
		FROM contacts
		WHERE role = $1
		ORDER BY last_name, first_name
		LIMIT $2 OFFSET $3`

	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.db.Query(ctx, query, role, limit, opts.Offset)
	if err != nil {
		return nil, fmt.Errorf("listing contacts by role: %w", err)
	}
	defer rows.Close()

	var contacts []*domain.Contact
	for rows.Next() {
		var c domain.Contact
		err := rows.Scan(
			&c.ID, &c.FirstName, &c.LastName, &c.Email, &c.Phone, &c.CompanyName,
			&c.Role, &c.Notes, &c.ChatwootContactID, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning contact: %w", err)
		}
		contacts = append(contacts, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating contacts by role: %w", err)
	}
	return contacts, nil
}

// ============================================================================
// Property Repository
// ============================================================================

func (r *Repository) CreateProperty(ctx context.Context, p *domain.Property) error {
	query := `
		INSERT INTO properties (
			name, address, tier, commission_rate, cleaning_fee,
			cleaning_fee_commissionable, airbnb_ical_url, vrbo_ical_url,
			wifi_password, access_codes, hot_tub, hot_tub_temp_f, notes,
			supply_list, checklist_template_id, active
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		p.Name, p.Address, p.Tier, p.CommissionRate, p.CleaningFee,
		p.CleaningFeeCommissionable, p.AirbnbIcalURL, p.VRBOIcalURL,
		p.WifiPassword, p.AccessCodes, p.HotTub, p.HotTubTempF, p.Notes,
		p.SupplyList, p.ChecklistTemplateID, p.Active,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating property: %w", err)
	}
	return nil
}

func (r *Repository) GetPropertyByID(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	query := `
		SELECT id, name, address, tier, commission_rate, cleaning_fee,
			   cleaning_fee_commissionable, airbnb_ical_url, vrbo_ical_url,
			   wifi_password, access_codes, hot_tub, hot_tub_temp_f, notes,
			   supply_list, checklist_template_id, active, created_at, updated_at
		FROM properties
		WHERE id = $1`

	var p domain.Property
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.Name, &p.Address, &p.Tier, &p.CommissionRate, &p.CleaningFee,
		&p.CleaningFeeCommissionable, &p.AirbnbIcalURL, &p.VRBOIcalURL,
		&p.WifiPassword, &p.AccessCodes, &p.HotTub, &p.HotTubTempF, &p.Notes,
		&p.SupplyList, &p.ChecklistTemplateID, &p.Active, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying property by id: %w", err)
	}
	return &p, nil
}

func (r *Repository) ListProperties(ctx context.Context, opts domain.ListOptions) ([]*domain.Property, error) {
	query := `
		SELECT id, name, address, tier, commission_rate, cleaning_fee,
			   cleaning_fee_commissionable, airbnb_ical_url, vrbo_ical_url,
			   wifi_password, access_codes, hot_tub, hot_tub_temp_f, notes,
			   supply_list, checklist_template_id, active, created_at, updated_at
		FROM properties
		WHERE active = true
		ORDER BY name
		LIMIT $1 OFFSET $2`

	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.db.Query(ctx, query, limit, opts.Offset)
	if err != nil {
		return nil, fmt.Errorf("listing properties: %w", err)
	}
	defer rows.Close()

	var properties []*domain.Property
	for rows.Next() {
		var p domain.Property
		err := rows.Scan(
			&p.ID, &p.Name, &p.Address, &p.Tier, &p.CommissionRate, &p.CleaningFee,
			&p.CleaningFeeCommissionable, &p.AirbnbIcalURL, &p.VRBOIcalURL,
			&p.WifiPassword, &p.AccessCodes, &p.HotTub, &p.HotTubTempF, &p.Notes,
			&p.SupplyList, &p.ChecklistTemplateID, &p.Active, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning property: %w", err)
		}
		properties = append(properties, &p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating properties: %w", err)
	}
	return properties, nil
}

func (r *Repository) UpdateProperty(ctx context.Context, p *domain.Property) error {
	query := `
		UPDATE properties SET
			name = $2, address = $3, tier = $4, commission_rate = $5, cleaning_fee = $6,
			cleaning_fee_commissionable = $7, airbnb_ical_url = $8, vrbo_ical_url = $9,
			wifi_password = $10, access_codes = $11, hot_tub = $12, hot_tub_temp_f = $13,
			notes = $14, supply_list = $15, checklist_template_id = $16, active = $17,
			updated_at = now()
		WHERE id = $1
		RETURNING updated_at`

	err := r.db.QueryRow(ctx, query,
		p.ID, p.Name, p.Address, p.Tier, p.CommissionRate, p.CleaningFee,
		p.CleaningFeeCommissionable, p.AirbnbIcalURL, p.VRBOIcalURL,
		p.WifiPassword, p.AccessCodes, p.HotTub, p.HotTubTempF, p.Notes,
		p.SupplyList, p.ChecklistTemplateID, p.Active,
	).Scan(&p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("updating property: %w", err)
	}
	return nil
}

// GetPropertiesByOwner returns all properties owned by a contact
func (r *Repository) GetPropertiesByOwner(ctx context.Context, contactID uuid.UUID) ([]*domain.Property, error) {
	query := `
		SELECT p.id, p.name, p.address, p.tier, p.commission_rate, p.cleaning_fee,
			   p.cleaning_fee_commissionable, p.airbnb_ical_url, p.vrbo_ical_url,
			   p.wifi_password, p.access_codes, p.hot_tub, p.hot_tub_temp_f, p.notes,
			   p.supply_list, p.checklist_template_id, p.active, p.created_at, p.updated_at
		FROM properties p
		INNER JOIN property_owners po ON p.id = po.property_id
		WHERE po.contact_id = $1 AND p.active = true
		ORDER BY p.name`

	rows, err := r.db.Query(ctx, query, contactID)
	if err != nil {
		return nil, fmt.Errorf("getting properties by owner: %w", err)
	}
	defer rows.Close()

	var properties []*domain.Property
	for rows.Next() {
		var p domain.Property
		err := rows.Scan(
			&p.ID, &p.Name, &p.Address, &p.Tier, &p.CommissionRate, &p.CleaningFee,
			&p.CleaningFeeCommissionable, &p.AirbnbIcalURL, &p.VRBOIcalURL,
			&p.WifiPassword, &p.AccessCodes, &p.HotTub, &p.HotTubTempF, &p.Notes,
			&p.SupplyList, &p.ChecklistTemplateID, &p.Active, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning property: %w", err)
		}
		properties = append(properties, &p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating properties by owner: %w", err)
	}
	return properties, nil
}

// OwnerHasProperty checks if a contact owns a specific property
func (r *Repository) OwnerHasProperty(ctx context.Context, contactID, propertyID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM property_owners WHERE contact_id = $1 AND property_id = $2)`
	var exists bool
	err := r.db.QueryRow(ctx, query, contactID, propertyID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("checking owner has property: %w", err)
	}
	return exists, nil
}

// ============================================================================
// Booking Repository
// ============================================================================

func (r *Repository) CreateBooking(ctx context.Context, b *domain.Booking) error {
	query := `
		INSERT INTO bookings (
			property_id, source, tax_treatment, external_uid, guest_name,
			guest_email, guest_phone, check_in, check_out, nightly_rate,
			nightly_rate_weekend, nightly_rate_holiday, revenue_incl_cleaning_fee,
			revenue_excl_cleaning_fee, cleaning_fee_charged, gst, pst, mrdt, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
		RETURNING id, nights, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		b.PropertyID, b.Source, b.TaxTreatment, b.ExternalUID, b.GuestName,
		b.GuestEmail, b.GuestPhone, b.CheckIn, b.CheckOut, b.NightlyRate,
		b.NightlyRateWeekend, b.NightlyRateHoliday, b.RevenueInclCleaningFee,
		b.RevenueExclCleaningFee, b.CleaningFeeCharged, b.GST, b.PST, b.MRDT, b.Notes,
	).Scan(&b.ID, &b.Nights, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating booking: %w", err)
	}
	return nil
}

func (r *Repository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	query := `
		SELECT id, property_id, source, tax_treatment, external_uid, guest_name,
			   guest_email, guest_phone, check_in, check_out, nights, nightly_rate,
			   nightly_rate_weekend, nightly_rate_holiday, revenue_incl_cleaning_fee,
			   revenue_excl_cleaning_fee, cleaning_fee_charged, gst, pst, mrdt, notes,
			   cleaning_job_id, statement_id, chatwoot_conversation_id, created_at, updated_at
		FROM bookings
		WHERE id = $1`

	var b domain.Booking
	err := r.db.QueryRow(ctx, query, id).Scan(
		&b.ID, &b.PropertyID, &b.Source, &b.TaxTreatment, &b.ExternalUID, &b.GuestName,
		&b.GuestEmail, &b.GuestPhone, &b.CheckIn, &b.CheckOut, &b.Nights, &b.NightlyRate,
		&b.NightlyRateWeekend, &b.NightlyRateHoliday, &b.RevenueInclCleaningFee,
		&b.RevenueExclCleaningFee, &b.CleaningFeeCharged, &b.GST, &b.PST, &b.MRDT, &b.Notes,
		&b.CleaningJobID, &b.StatementID, &b.ChatwootConversationID, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying booking by id: %w", err)
	}
	return &b, nil
}

func (r *Repository) GetBookingByExternalUID(ctx context.Context, uid string) (*domain.Booking, error) {
	query := `
		SELECT id, property_id, source, tax_treatment, external_uid, guest_name,
			   guest_email, guest_phone, check_in, check_out, nights, nightly_rate,
			   nightly_rate_weekend, nightly_rate_holiday, revenue_incl_cleaning_fee,
			   revenue_excl_cleaning_fee, cleaning_fee_charged, gst, pst, mrdt, notes,
			   cleaning_job_id, statement_id, chatwoot_conversation_id, created_at, updated_at
		FROM bookings
		WHERE external_uid = $1`

	var b domain.Booking
	err := r.db.QueryRow(ctx, query, uid).Scan(
		&b.ID, &b.PropertyID, &b.Source, &b.TaxTreatment, &b.ExternalUID, &b.GuestName,
		&b.GuestEmail, &b.GuestPhone, &b.CheckIn, &b.CheckOut, &b.Nights, &b.NightlyRate,
		&b.NightlyRateWeekend, &b.NightlyRateHoliday, &b.RevenueInclCleaningFee,
		&b.RevenueExclCleaningFee, &b.CleaningFeeCharged, &b.GST, &b.PST, &b.MRDT, &b.Notes,
		&b.CleaningJobID, &b.StatementID, &b.ChatwootConversationID, &b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying booking by external uid: %w", err)
	}
	return &b, nil
}

func (r *Repository) ListBookingsByProperty(ctx context.Context, propertyID uuid.UUID, opts domain.ListOptions) ([]*domain.Booking, error) {
	query := `
		SELECT id, property_id, source, tax_treatment, external_uid, guest_name,
			   guest_email, guest_phone, check_in, check_out, nights, nightly_rate,
			   nightly_rate_weekend, nightly_rate_holiday, revenue_incl_cleaning_fee,
			   revenue_excl_cleaning_fee, cleaning_fee_charged, gst, pst, mrdt, notes,
			   cleaning_job_id, statement_id, chatwoot_conversation_id, created_at, updated_at
		FROM bookings
		WHERE property_id = $1
		ORDER BY check_in DESC
		LIMIT $2 OFFSET $3`

	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	rows, err := r.db.Query(ctx, query, propertyID, limit, opts.Offset)
	if err != nil {
		return nil, fmt.Errorf("listing bookings by property: %w", err)
	}
	defer rows.Close()

	var bookings []*domain.Booking
	for rows.Next() {
		var b domain.Booking
		err := rows.Scan(
			&b.ID, &b.PropertyID, &b.Source, &b.TaxTreatment, &b.ExternalUID, &b.GuestName,
			&b.GuestEmail, &b.GuestPhone, &b.CheckIn, &b.CheckOut, &b.Nights, &b.NightlyRate,
			&b.NightlyRateWeekend, &b.NightlyRateHoliday, &b.RevenueInclCleaningFee,
			&b.RevenueExclCleaningFee, &b.CleaningFeeCharged, &b.GST, &b.PST, &b.MRDT, &b.Notes,
			&b.CleaningJobID, &b.StatementID, &b.ChatwootConversationID, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning booking: %w", err)
		}
		bookings = append(bookings, &b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating bookings: %w", err)
	}
	return bookings, nil
}

// ============================================================================
// Cleaning Job Repository
// ============================================================================

func (r *Repository) CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error {
	query := `
		INSERT INTO cleaning_jobs (
			property_id, booking_id, scheduled_date, scheduled_time, status,
			comp_model, job_rate, hot_tub_photo_required, internal_notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		j.PropertyID, j.BookingID, j.ScheduledDate, j.ScheduledTime, j.Status,
		j.CompModel, j.JobRate, j.HotTubPhotoRequired, j.InternalNotes,
	).Scan(&j.ID, &j.CreatedAt, &j.UpdatedAt)
	if err != nil {
		return fmt.Errorf("creating cleaning job: %w", err)
	}
	return nil
}

func (r *Repository) GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error) {
	query := `
		SELECT id, property_id, booking_id, scheduled_date, scheduled_time, status,
			   comp_model, job_rate, duration_hours, arrived_at, completed_at,
			   checklist_data, checklist_completion_pct, hot_tub_photo_required,
			   hot_tub_status, damage_notes, restock_notes, internal_notes,
			   dispatched_at, reminder_sent_at, created_at, updated_at
		FROM cleaning_jobs
		WHERE id = $1`

	var j domain.CleaningJob
	err := r.db.QueryRow(ctx, query, id).Scan(
		&j.ID, &j.PropertyID, &j.BookingID, &j.ScheduledDate, &j.ScheduledTime, &j.Status,
		&j.CompModel, &j.JobRate, &j.DurationHours, &j.ArrivedAt, &j.CompletedAt,
		&j.ChecklistData, &j.ChecklistCompletionPct, &j.HotTubPhotoRequired,
		&j.HotTubStatus, &j.DamageNotes, &j.RestockNotes, &j.InternalNotes,
		&j.DispatchedAt, &j.ReminderSentAt, &j.CreatedAt, &j.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("querying cleaning job by id: %w", err)
	}
	return &j, nil
}

func (r *Repository) UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status domain.JobStatus) error {
	query := `UPDATE cleaning_jobs SET status = $2, updated_at = now() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id, status)
	if err != nil {
		return fmt.Errorf("updating cleaning job status: %w", err)
	}
	return nil
}

func (r *Repository) ClockInCleaningJob(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE cleaning_jobs SET arrived_at = now(), status = 'in_progress', updated_at = now() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("clocking in cleaning job: %w", err)
	}
	return nil
}

func (r *Repository) ClockOutCleaningJob(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE cleaning_jobs SET
			completed_at = now(),
			status = 'complete',
			duration_hours = EXTRACT(EPOCH FROM (now() - arrived_at)) / 3600,
			updated_at = now()
		WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("clocking out cleaning job: %w", err)
	}
	return nil
}

func (r *Repository) ListCleaningJobsByDate(ctx context.Context, date time.Time) ([]*domain.CleaningJob, error) {
	query := `
		SELECT id, property_id, booking_id, scheduled_date, scheduled_time, status,
			   comp_model, job_rate, duration_hours, arrived_at, completed_at,
			   checklist_data, checklist_completion_pct, hot_tub_photo_required,
			   hot_tub_status, damage_notes, restock_notes, internal_notes,
			   dispatched_at, reminder_sent_at, created_at, updated_at
		FROM cleaning_jobs
		WHERE scheduled_date = $1
		ORDER BY scheduled_time, created_at`

	rows, err := r.db.Query(ctx, query, date)
	if err != nil {
		return nil, fmt.Errorf("listing cleaning jobs by date: %w", err)
	}
	defer rows.Close()

	var jobs []*domain.CleaningJob
	for rows.Next() {
		var j domain.CleaningJob
		err := rows.Scan(
			&j.ID, &j.PropertyID, &j.BookingID, &j.ScheduledDate, &j.ScheduledTime, &j.Status,
			&j.CompModel, &j.JobRate, &j.DurationHours, &j.ArrivedAt, &j.CompletedAt,
			&j.ChecklistData, &j.ChecklistCompletionPct, &j.HotTubPhotoRequired,
			&j.HotTubStatus, &j.DamageNotes, &j.RestockNotes, &j.InternalNotes,
			&j.DispatchedAt, &j.ReminderSentAt, &j.CreatedAt, &j.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning cleaning job: %w", err)
		}
		jobs = append(jobs, &j)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating cleaning jobs by date: %w", err)
	}
	return jobs, nil
}

func (r *Repository) ListCleaningJobsByStaff(ctx context.Context, contactID uuid.UUID, date *time.Time, opts domain.ListOptions) ([]*domain.CleaningJob, error) {
	limit := opts.Limit
	if limit <= 0 {
		limit = 50
	}

	var query string
	var rows pgx.Rows
	var err error

	if date != nil {
		query = `
			SELECT cj.id, cj.property_id, cj.booking_id, cj.scheduled_date, cj.scheduled_time, cj.status,
				   cj.comp_model, cj.job_rate, cj.duration_hours, cj.arrived_at, cj.completed_at,
				   cj.checklist_data, cj.checklist_completion_pct, cj.hot_tub_photo_required,
				   cj.hot_tub_status, cj.damage_notes, cj.restock_notes, cj.internal_notes,
				   cj.dispatched_at, cj.reminder_sent_at, cj.created_at, cj.updated_at
			FROM cleaning_jobs cj
			INNER JOIN cleaning_job_staff cjs ON cj.id = cjs.job_id
			WHERE cjs.contact_id = $1 AND cj.scheduled_date = $2
			ORDER BY cj.scheduled_time
			LIMIT $3 OFFSET $4`
		rows, err = r.db.Query(ctx, query, contactID, *date, limit, opts.Offset)
	} else {
		query = `
			SELECT cj.id, cj.property_id, cj.booking_id, cj.scheduled_date, cj.scheduled_time, cj.status,
				   cj.comp_model, cj.job_rate, cj.duration_hours, cj.arrived_at, cj.completed_at,
				   cj.checklist_data, cj.checklist_completion_pct, cj.hot_tub_photo_required,
				   cj.hot_tub_status, cj.damage_notes, cj.restock_notes, cj.internal_notes,
				   cj.dispatched_at, cj.reminder_sent_at, cj.created_at, cj.updated_at
			FROM cleaning_jobs cj
			INNER JOIN cleaning_job_staff cjs ON cj.id = cjs.job_id
			WHERE cjs.contact_id = $1
			ORDER BY cj.scheduled_date DESC, cj.scheduled_time
			LIMIT $2 OFFSET $3`
		rows, err = r.db.Query(ctx, query, contactID, limit, opts.Offset)
	}
	if err != nil {
		return nil, fmt.Errorf("listing cleaning jobs by staff: %w", err)
	}
	defer rows.Close()

	var jobs []*domain.CleaningJob
	for rows.Next() {
		var j domain.CleaningJob
		err := rows.Scan(
			&j.ID, &j.PropertyID, &j.BookingID, &j.ScheduledDate, &j.ScheduledTime, &j.Status,
			&j.CompModel, &j.JobRate, &j.DurationHours, &j.ArrivedAt, &j.CompletedAt,
			&j.ChecklistData, &j.ChecklistCompletionPct, &j.HotTubPhotoRequired,
			&j.HotTubStatus, &j.DamageNotes, &j.RestockNotes, &j.InternalNotes,
			&j.DispatchedAt, &j.ReminderSentAt, &j.CreatedAt, &j.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scanning cleaning job: %w", err)
		}
		jobs = append(jobs, &j)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating cleaning jobs by staff: %w", err)
	}
	return jobs, nil
}

// IsStaffAssignedToJob checks if a contact is assigned to a cleaning job
func (r *Repository) IsStaffAssignedToJob(ctx context.Context, jobID, contactID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM cleaning_job_staff WHERE job_id = $1 AND contact_id = $2)`
	var exists bool
	err := r.db.QueryRow(ctx, query, jobID, contactID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("checking staff assignment: %w", err)
	}
	return exists, nil
}

// AssignStaffToJob assigns a cleaner to a cleaning job
func (r *Repository) AssignStaffToJob(ctx context.Context, jobID, contactID uuid.UUID, hourlyRate float64) error {
	query := `
		INSERT INTO cleaning_job_staff (job_id, contact_id, hourly_rate)
		VALUES ($1, $2, $3)
		ON CONFLICT (job_id, contact_id) DO UPDATE SET hourly_rate = $3`

	_, err := r.db.Exec(ctx, query, jobID, contactID, hourlyRate)
	if err != nil {
		return fmt.Errorf("assigning staff to job: %w", err)
	}
	return nil
}

// GetStaffForJob returns all contacts assigned to a cleaning job
func (r *Repository) GetStaffForJob(ctx context.Context, jobID uuid.UUID) ([]*domain.Contact, error) {
	query := `
		SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.company_name, c.role,
		       c.notes, c.chatwoot_contact_id, c.created_at, c.updated_at
		FROM contacts c
		INNER JOIN cleaning_job_staff cjs ON cjs.contact_id = c.id
		WHERE cjs.job_id = $1`

	rows, err := r.db.Query(ctx, query, jobID)
	if err != nil {
		return nil, fmt.Errorf("querying staff for job: %w", err)
	}
	defer rows.Close()

	var staff []*domain.Contact
	for rows.Next() {
		var c domain.Contact
		if err := rows.Scan(
			&c.ID, &c.FirstName, &c.LastName, &c.Email, &c.Phone, &c.CompanyName, &c.Role,
			&c.Notes, &c.ChatwootContactID, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scanning contact: %w", err)
		}
		staff = append(staff, &c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating staff: %w", err)
	}

	return staff, nil
}

// MarkReminderSent marks a cleaning job as having had its reminder sent
func (r *Repository) MarkReminderSent(ctx context.Context, jobID uuid.UUID) error {
	query := `UPDATE cleaning_jobs SET reminder_sent_at = NOW(), updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, jobID)
	if err != nil {
		return fmt.Errorf("marking reminder sent: %w", err)
	}
	return nil
}
