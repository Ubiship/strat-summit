package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ubiship/strat-summit/backend/internal/domain"
	"github.com/ubiship/strat-summit/backend/internal/integrations/chatwoot"
)

// mockRepository implements the Repository interface for testing
type mockRepository struct {
	// Pending contacts
	pendingContacts    []*domain.PendingContact
	pendingContactByID map[uuid.UUID]*domain.PendingContact
	pendingContactByCW map[int64]*domain.PendingContact
	createdPending     *domain.PendingContact
	reviewedPendingID  uuid.UUID
	reviewedAction     string
	reviewedMergedWith *uuid.UUID

	// Contacts
	contacts          map[uuid.UUID]*domain.Contact
	contactByEmail    map[string]*domain.Contact
	contactByPhone    map[string]*domain.Contact
	contactByChatwoot map[int64]*domain.Contact
	createdContact    *domain.Contact
	updatedContact    *domain.Contact
	setChatwootID     int64

	// Bookings
	bookingByConversation     map[int64]*domain.Booking
	updatedBookingID          uuid.UUID
	updatedBookingNotes       string
	bookingChatwootConvID     int64
	bookingChatwootConvSet    uuid.UUID

	// Projects
	projectByConversation     map[int64]*domain.Project
	projectResolved           uuid.UUID
	projectChatwootConvID     int64
	projectChatwootConvSet    uuid.UUID

	// Error simulation
	shouldError bool
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		pendingContacts:       make([]*domain.PendingContact, 0),
		pendingContactByID:    make(map[uuid.UUID]*domain.PendingContact),
		pendingContactByCW:    make(map[int64]*domain.PendingContact),
		contacts:              make(map[uuid.UUID]*domain.Contact),
		contactByEmail:        make(map[string]*domain.Contact),
		contactByPhone:        make(map[string]*domain.Contact),
		contactByChatwoot:     make(map[int64]*domain.Contact),
		bookingByConversation: make(map[int64]*domain.Booking),
		projectByConversation: make(map[int64]*domain.Project),
	}
}

// Ensure mockRepository implements Repository interface
var _ Repository = (*mockRepository)(nil)

// User methods
func (m *mockRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, errors.New("not implemented")
}

func (m *mockRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return nil, errors.New("not implemented")
}

func (m *mockRepository) UpdateRefreshToken(ctx context.Context, userID uuid.UUID, hash *string, expiresAt *time.Time) error {
	return nil
}

func (m *mockRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	return nil
}

// Contact methods
func (m *mockRepository) CreateContact(ctx context.Context, c *domain.Contact) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	c.ID = uuid.New()
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()
	m.createdContact = c
	m.contacts[c.ID] = c
	return nil
}

func (m *mockRepository) GetContactByID(ctx context.Context, id uuid.UUID) (*domain.Contact, error) {
	if c, ok := m.contacts[id]; ok {
		return c, nil
	}
	return nil, errors.New("not found")
}

func (m *mockRepository) GetContactByEmail(ctx context.Context, email string) (*domain.Contact, error) {
	if c, ok := m.contactByEmail[email]; ok {
		return c, nil
	}
	return nil, errors.New("not found")
}

func (m *mockRepository) ListContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.Contact, error) {
	return nil, nil
}

func (m *mockRepository) ListContactsByRole(ctx context.Context, role domain.UserRole, opts domain.ListOptions) ([]*domain.Contact, error) {
	return nil, nil
}

func (m *mockRepository) FindContactByPhone(ctx context.Context, phone string) (*domain.Contact, error) {
	return m.contactByPhone[phone], nil
}

func (m *mockRepository) FindContactByChatwootID(ctx context.Context, chatwootID int64) (*domain.Contact, error) {
	return m.contactByChatwoot[chatwootID], nil
}

func (m *mockRepository) SetChatwootContactID(ctx context.Context, contactID uuid.UUID, chatwootID int64) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	m.setChatwootID = chatwootID
	return nil
}

func (m *mockRepository) UpdateContact(ctx context.Context, c *domain.Contact) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	c.UpdatedAt = time.Now()
	m.updatedContact = c
	return nil
}

// Property methods
func (m *mockRepository) CreateProperty(ctx context.Context, p *domain.Property) error {
	return nil
}

func (m *mockRepository) GetPropertyByID(ctx context.Context, id uuid.UUID) (*domain.Property, error) {
	return nil, errors.New("not implemented")
}

func (m *mockRepository) ListProperties(ctx context.Context, opts domain.ListOptions) ([]*domain.Property, error) {
	return nil, nil
}

func (m *mockRepository) GetPropertiesByOwner(ctx context.Context, contactID uuid.UUID) ([]*domain.Property, error) {
	return nil, nil
}

func (m *mockRepository) OwnerHasProperty(ctx context.Context, contactID, propertyID uuid.UUID) (bool, error) {
	return false, nil
}

func (m *mockRepository) UpdateProperty(ctx context.Context, p *domain.Property) error {
	return nil
}

// Booking methods
func (m *mockRepository) CreateBooking(ctx context.Context, b *domain.Booking) error {
	return nil
}

func (m *mockRepository) GetBookingByID(ctx context.Context, id uuid.UUID) (*domain.Booking, error) {
	return nil, errors.New("not implemented")
}

func (m *mockRepository) ListBookingsByProperty(ctx context.Context, propertyID uuid.UUID, opts domain.ListOptions) ([]*domain.Booking, error) {
	return nil, nil
}

func (m *mockRepository) FindOpenBookingByOwner(ctx context.Context, ownerID uuid.UUID) (*domain.Booking, error) {
	return nil, nil
}

func (m *mockRepository) SetBookingChatwootConversation(ctx context.Context, bookingID uuid.UUID, conversationID int64) error {
	m.bookingChatwootConvSet = bookingID
	m.bookingChatwootConvID = conversationID
	return nil
}

func (m *mockRepository) FindBookingByChatwootConversation(ctx context.Context, conversationID int64) (*domain.Booking, error) {
	return m.bookingByConversation[conversationID], nil
}

func (m *mockRepository) UpdateBookingStatus(ctx context.Context, bookingID uuid.UUID, notes string) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	m.updatedBookingID = bookingID
	m.updatedBookingNotes = notes
	return nil
}

// Cleaning job methods
func (m *mockRepository) CreateCleaningJob(ctx context.Context, j *domain.CleaningJob) error {
	return nil
}

func (m *mockRepository) GetCleaningJobByID(ctx context.Context, id uuid.UUID) (*domain.CleaningJob, error) {
	return nil, errors.New("not implemented")
}

func (m *mockRepository) UpdateCleaningJobStatus(ctx context.Context, id uuid.UUID, status domain.JobStatus) error {
	return nil
}

func (m *mockRepository) ClockInCleaningJob(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (m *mockRepository) ClockOutCleaningJob(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (m *mockRepository) ListCleaningJobsByDate(ctx context.Context, date time.Time) ([]*domain.CleaningJob, error) {
	return nil, nil
}

func (m *mockRepository) ListCleaningJobsByStaff(ctx context.Context, contactID uuid.UUID, date *time.Time, opts domain.ListOptions) ([]*domain.CleaningJob, error) {
	return nil, nil
}

func (m *mockRepository) IsStaffAssignedToJob(ctx context.Context, jobID, contactID uuid.UUID) (bool, error) {
	return false, nil
}

func (m *mockRepository) AssignStaffToJob(ctx context.Context, jobID, contactID uuid.UUID, hourlyRate float64) error {
	return nil
}

// Project methods
func (m *mockRepository) FindOpenProjectByClient(ctx context.Context, clientID uuid.UUID) (*domain.Project, error) {
	return nil, nil
}

func (m *mockRepository) SetProjectChatwootConversation(ctx context.Context, projectID uuid.UUID, conversationID int64) error {
	m.projectChatwootConvSet = projectID
	m.projectChatwootConvID = conversationID
	return nil
}

func (m *mockRepository) FindProjectByChatwootConversation(ctx context.Context, conversationID int64) (*domain.Project, error) {
	return m.projectByConversation[conversationID], nil
}

func (m *mockRepository) SetProjectConversationResolved(ctx context.Context, projectID uuid.UUID, resolved bool) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	m.projectResolved = projectID
	return nil
}

// Chatwoot sync methods
func (m *mockRepository) CreateChatwootEvent(ctx context.Context, event *domain.ChatwootEvent) error {
	return nil
}

func (m *mockRepository) ListUnreviewedPendingContacts(ctx context.Context, opts domain.ListOptions) ([]*domain.PendingContact, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.pendingContacts, nil
}

func (m *mockRepository) GetPendingContactByID(ctx context.Context, id uuid.UUID) (*domain.PendingContact, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	if pc, ok := m.pendingContactByID[id]; ok {
		return pc, nil
	}
	return nil, errors.New("not found")
}

func (m *mockRepository) GetPendingContactByChatwootID(ctx context.Context, chatwootID int64) (*domain.PendingContact, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.pendingContactByCW[chatwootID], nil
}

func (m *mockRepository) CreatePendingContact(ctx context.Context, pc *domain.PendingContact) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	pc.ID = uuid.New()
	pc.CreatedAt = time.Now()
	m.createdPending = pc
	return nil
}

func (m *mockRepository) MarkPendingContactReviewed(ctx context.Context, id, reviewerID uuid.UUID, action string, mergedWithID *uuid.UUID) error {
	if m.shouldError {
		return errors.New("mock error")
	}
	m.reviewedPendingID = id
	m.reviewedAction = action
	m.reviewedMergedWith = mergedWithID
	return nil
}

// ============================================================================
// Tests
// ============================================================================

func TestListPendingContacts(t *testing.T) {
	mock := newMockRepository()
	mock.pendingContacts = []*domain.PendingContact{
		{ID: uuid.New(), Name: "Test 1", ChatwootContactID: 1},
		{ID: uuid.New(), Name: "Test 2", ChatwootContactID: 2},
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	result, err := svc.ListPendingContacts(context.Background(), authCtx, domain.ListOptions{})
	if err != nil {
		t.Fatalf("ListPendingContacts failed: %v", err)
	}

	if len(result) != 2 {
		t.Errorf("expected 2 pending contacts, got %d", len(result))
	}
}

func TestListPendingContacts_Forbidden(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleCleaner}

	_, err := svc.ListPendingContacts(context.Background(), authCtx, domain.ListOptions{})
	if err == nil {
		t.Error("expected forbidden error for non-admin")
	}
	if !errors.Is(err, ErrForbidden) {
		t.Errorf("expected ErrForbidden, got %v", err)
	}
}

func TestGetPendingContact(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()
	mock.pendingContactByID[pendingID] = &domain.PendingContact{
		ID:                pendingID,
		Name:              "Test Contact",
		ChatwootContactID: 123,
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	result, err := svc.GetPendingContact(context.Background(), authCtx, pendingID)
	if err != nil {
		t.Fatalf("GetPendingContact failed: %v", err)
	}

	if result.Name != "Test Contact" {
		t.Errorf("expected name 'Test Contact', got %s", result.Name)
	}
}

func TestApprovePendingContact(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()
	targetContactID := uuid.New()

	mock.pendingContactByID[pendingID] = &domain.PendingContact{
		ID:                pendingID,
		Name:              "Test Contact",
		ChatwootContactID: 456,
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	err := svc.ApprovePendingContact(context.Background(), authCtx, pendingID, targetContactID)
	if err != nil {
		t.Fatalf("ApprovePendingContact failed: %v", err)
	}

	// Verify Chatwoot ID was set
	if mock.setChatwootID != 456 {
		t.Errorf("expected setChatwootID 456, got %d", mock.setChatwootID)
	}

	// Verify pending was marked reviewed
	if mock.reviewedPendingID != pendingID {
		t.Errorf("expected reviewedPendingID %s, got %s", pendingID, mock.reviewedPendingID)
	}
	if mock.reviewedAction != "merged" {
		t.Errorf("expected action 'merged', got %s", mock.reviewedAction)
	}
	if *mock.reviewedMergedWith != targetContactID {
		t.Errorf("expected mergedWithID %s, got %s", targetContactID, *mock.reviewedMergedWith)
	}
}

func TestApprovePendingContact_AlreadyReviewed(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()
	reviewedAt := time.Now()

	mock.pendingContactByID[pendingID] = &domain.PendingContact{
		ID:                pendingID,
		Name:              "Already Reviewed",
		ChatwootContactID: 456,
		ReviewedAt:        &reviewedAt,
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	err := svc.ApprovePendingContact(context.Background(), authCtx, pendingID, uuid.New())
	if err == nil {
		t.Error("expected error for already reviewed contact")
	}
}

func TestCreateContactFromPending(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()
	email := "test@example.com"
	phone := "+1234567890"

	mock.pendingContactByID[pendingID] = &domain.PendingContact{
		ID:                pendingID,
		Name:              "John Doe",
		Email:             &email,
		Phone:             &phone,
		ChatwootContactID: 789,
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	result, err := svc.CreateContactFromPending(context.Background(), authCtx, pendingID, domain.RolePMOwner)
	if err != nil {
		t.Fatalf("CreateContactFromPending failed: %v", err)
	}

	// Verify contact was created
	if mock.createdContact == nil {
		t.Fatal("expected contact to be created")
	}
	if mock.createdContact.FirstName != "John" {
		t.Errorf("expected first name 'John', got %s", mock.createdContact.FirstName)
	}
	if mock.createdContact.LastName != "Doe" {
		t.Errorf("expected last name 'Doe', got %s", mock.createdContact.LastName)
	}
	if mock.createdContact.Role != domain.RolePMOwner {
		t.Errorf("expected role pm_owner, got %s", mock.createdContact.Role)
	}
	if *mock.createdContact.ChatwootContactID != 789 {
		t.Errorf("expected ChatwootContactID 789, got %d", *mock.createdContact.ChatwootContactID)
	}

	// Verify pending was marked reviewed
	if mock.reviewedAction != "created" {
		t.Errorf("expected action 'created', got %s", mock.reviewedAction)
	}

	// Verify result
	if result.FirstName != "John" {
		t.Errorf("expected result first name 'John', got %s", result.FirstName)
	}
}

func TestRejectPendingContact(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()

	mock.pendingContactByID[pendingID] = &domain.PendingContact{
		ID:                pendingID,
		Name:              "Spam Contact",
		ChatwootContactID: 999,
	}

	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	err := svc.RejectPendingContact(context.Background(), authCtx, pendingID, "spam")
	if err != nil {
		t.Fatalf("RejectPendingContact failed: %v", err)
	}

	// Verify pending was marked rejected
	if mock.reviewedPendingID != pendingID {
		t.Errorf("expected reviewedPendingID %s, got %s", pendingID, mock.reviewedPendingID)
	}
	if mock.reviewedAction != "rejected" {
		t.Errorf("expected action 'rejected', got %s", mock.reviewedAction)
	}
	if mock.reviewedMergedWith != nil {
		t.Errorf("expected nil mergedWithID, got %v", mock.reviewedMergedWith)
	}
}

func TestHandleMessageCreated_SkipsPrivate(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}

	msg := &chatwoot.Message{
		Content:     "Private note",
		MessageType: "incoming",
		Private:     true,
	}

	err := svc.HandleMessageCreated(context.Background(), msg, 123)
	if err != nil {
		t.Fatalf("HandleMessageCreated failed: %v", err)
	}
	// No error, private message was skipped
}

func TestHandleMessageCreated_SkipsOutgoing(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}

	msg := &chatwoot.Message{
		Content:     "Agent response",
		MessageType: "outgoing",
		Private:     false,
	}

	err := svc.HandleMessageCreated(context.Background(), msg, 123)
	if err != nil {
		t.Fatalf("HandleMessageCreated failed: %v", err)
	}
	// No error, outgoing message was skipped
}

func TestHandleMessageCreated_LinkedBooking(t *testing.T) {
	mock := newMockRepository()
	bookingID := uuid.New()
	convID := int64(456)

	mock.bookingByConversation[convID] = &domain.Booking{
		ID:         bookingID,
		PropertyID: uuid.New(),
	}

	svc := &Service{repo: mock}

	msg := &chatwoot.Message{
		Content:     "Customer message",
		MessageType: "incoming",
		Private:     false,
	}

	err := svc.HandleMessageCreated(context.Background(), msg, convID)
	if err != nil {
		t.Fatalf("HandleMessageCreated failed: %v", err)
	}
	// Message processed for linked booking (logged)
}

func TestHandleMessageCreated_LinkedProject(t *testing.T) {
	mock := newMockRepository()
	projectID := uuid.New()
	convID := int64(789)

	mock.projectByConversation[convID] = &domain.Project{
		ID:        projectID,
		ContactID: uuid.New(),
		Name:      "Test Project",
	}

	svc := &Service{repo: mock}

	msg := &chatwoot.Message{
		Content:     "Client message",
		MessageType: "incoming",
		Private:     false,
	}

	err := svc.HandleMessageCreated(context.Background(), msg, convID)
	if err != nil {
		t.Fatalf("HandleMessageCreated failed: %v", err)
	}
	// Message processed for linked project (logged)
}

func TestHandleConversationResolved_LinkedBooking(t *testing.T) {
	mock := newMockRepository()
	bookingID := uuid.New()
	convID := int64(111)

	mock.bookingByConversation[convID] = &domain.Booking{
		ID:         bookingID,
		PropertyID: uuid.New(),
	}

	svc := &Service{repo: mock}

	err := svc.HandleConversationResolved(context.Background(), convID)
	if err != nil {
		t.Fatalf("HandleConversationResolved failed: %v", err)
	}

	// Verify booking was updated
	if mock.updatedBookingID != bookingID {
		t.Errorf("expected updatedBookingID %s, got %s", bookingID, mock.updatedBookingID)
	}
	if mock.updatedBookingNotes == "" {
		t.Error("expected booking notes to be updated")
	}
}

func TestHandleConversationResolved_LinkedProject(t *testing.T) {
	mock := newMockRepository()
	projectID := uuid.New()
	convID := int64(222)

	mock.projectByConversation[convID] = &domain.Project{
		ID:        projectID,
		ContactID: uuid.New(),
		Name:      "Test Project",
	}

	svc := &Service{repo: mock}

	err := svc.HandleConversationResolved(context.Background(), convID)
	if err != nil {
		t.Fatalf("HandleConversationResolved failed: %v", err)
	}

	// Verify project was marked resolved
	if mock.projectResolved != projectID {
		t.Errorf("expected projectResolved %s, got %s", projectID, mock.projectResolved)
	}
}

func TestHandleConversationResolved_Unlinked(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}

	// Conversation not linked to anything
	err := svc.HandleConversationResolved(context.Background(), 999)
	if err != nil {
		t.Fatalf("HandleConversationResolved failed: %v", err)
	}
	// No error, just logged
}

func TestUpdateContact_Admin(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleAdmin}

	contact := &domain.Contact{
		ID:        uuid.New(),
		FirstName: "Updated",
		LastName:  "Name",
		Role:      domain.RolePMOwner,
	}

	err := svc.UpdateContact(context.Background(), authCtx, contact)
	if err != nil {
		t.Fatalf("UpdateContact failed: %v", err)
	}

	if mock.updatedContact == nil {
		t.Error("expected contact to be updated")
	}
	if mock.updatedContact.FirstName != "Updated" {
		t.Errorf("expected first name 'Updated', got %s", mock.updatedContact.FirstName)
	}
}

func TestUpdateContact_Forbidden(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}
	authCtx := &domain.AuthContext{UserID: uuid.New(), Role: domain.RoleCleaner}

	contact := &domain.Contact{
		ID:        uuid.New(),
		FirstName: "Test",
		LastName:  "User",
	}

	err := svc.UpdateContact(context.Background(), authCtx, contact)
	if err == nil {
		t.Error("expected forbidden error for non-admin")
	}
	if !errors.Is(err, ErrForbidden) {
		t.Errorf("expected ErrForbidden, got %v", err)
	}
}

func TestHandleContactCreatedFromChatwoot_MatchByPhone(t *testing.T) {
	mock := newMockRepository()
	contactID := uuid.New()
	phone := "+1234567890"

	mock.contactByPhone[phone] = &domain.Contact{
		ID:    contactID,
		Phone: &phone,
	}

	svc := &Service{repo: mock}

	cwContact := &chatwoot.Contact{
		ID:    123,
		Name:  "New Contact",
		Phone: phone,
	}

	err := svc.HandleContactCreatedFromChatwoot(context.Background(), cwContact)
	if err != nil {
		t.Fatalf("HandleContactCreatedFromChatwoot failed: %v", err)
	}

	// Verify Chatwoot ID was linked to existing contact
	if mock.setChatwootID != 123 {
		t.Errorf("expected setChatwootID 123, got %d", mock.setChatwootID)
	}
}

func TestHandleContactCreatedFromChatwoot_MatchByEmail(t *testing.T) {
	mock := newMockRepository()
	contactID := uuid.New()
	email := "test@example.com"

	mock.contactByEmail[email] = &domain.Contact{
		ID:    contactID,
		Email: &email,
	}

	svc := &Service{repo: mock}

	cwContact := &chatwoot.Contact{
		ID:    456,
		Name:  "New Contact",
		Email: email,
	}

	err := svc.HandleContactCreatedFromChatwoot(context.Background(), cwContact)
	if err != nil {
		t.Fatalf("HandleContactCreatedFromChatwoot failed: %v", err)
	}

	// Verify Chatwoot ID was linked to existing contact
	if mock.setChatwootID != 456 {
		t.Errorf("expected setChatwootID 456, got %d", mock.setChatwootID)
	}
}

func TestHandleContactCreatedFromChatwoot_CreatesPending(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock}

	email := "unknown@example.com"
	phone := "+9999999999"

	cwContact := &chatwoot.Contact{
		ID:    789,
		Name:  "Unknown Contact",
		Email: email,
		Phone: phone,
	}

	err := svc.HandleContactCreatedFromChatwoot(context.Background(), cwContact)
	if err != nil {
		t.Fatalf("HandleContactCreatedFromChatwoot failed: %v", err)
	}

	// Verify pending contact was created
	if mock.createdPending == nil {
		t.Fatal("expected pending contact to be created")
	}
	if mock.createdPending.ChatwootContactID != 789 {
		t.Errorf("expected ChatwootContactID 789, got %d", mock.createdPending.ChatwootContactID)
	}
	if mock.createdPending.Name != "Unknown Contact" {
		t.Errorf("expected name 'Unknown Contact', got %s", mock.createdPending.Name)
	}
}

func TestHandleContactCreatedFromChatwoot_SkipsDuplicate(t *testing.T) {
	mock := newMockRepository()
	pendingID := uuid.New()

	// Already have a pending contact for this Chatwoot ID
	mock.pendingContactByCW[111] = &domain.PendingContact{
		ID:                pendingID,
		ChatwootContactID: 111,
	}

	svc := &Service{repo: mock}

	cwContact := &chatwoot.Contact{
		ID:   111,
		Name: "Duplicate Contact",
	}

	err := svc.HandleContactCreatedFromChatwoot(context.Background(), cwContact)
	if err != nil {
		t.Fatalf("HandleContactCreatedFromChatwoot failed: %v", err)
	}

	// No new pending contact created
	if mock.createdPending != nil {
		t.Error("expected no new pending contact for duplicate")
	}
}

func TestParseFullName(t *testing.T) {
	tests := []struct {
		input         string
		expectedFirst string
		expectedLast  string
	}{
		{"John Doe", "John", "Doe"},
		{"John", "John", ""},
		{"John Middle Doe", "John", "Middle Doe"},
		{"  John   Doe  ", "John", "Doe"},
		{"", "", ""},
	}

	for _, tt := range tests {
		first, last := parseFullName(tt.input)
		if first != tt.expectedFirst {
			t.Errorf("parseFullName(%q) first = %q, want %q", tt.input, first, tt.expectedFirst)
		}
		if last != tt.expectedLast {
			t.Errorf("parseFullName(%q) last = %q, want %q", tt.input, last, tt.expectedLast)
		}
	}
}

// ============================================================================
// Outbound Conversation Tests
// ============================================================================

func TestCreateBookingConversation_NoChatwoot(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock, chatwoot: nil}

	email := "guest@example.com"
	booking := &domain.Booking{
		ID:         uuid.New(),
		GuestEmail: &email,
	}

	err := svc.CreateBookingConversation(context.Background(), booking)
	if err != nil {
		t.Fatalf("CreateBookingConversation should not error when chatwoot is nil: %v", err)
	}

	// No conversation should be set
	if mock.bookingChatwootConvID != 0 {
		t.Error("expected no conversation to be set when chatwoot is nil")
	}
}

func TestCreateBookingConversation_NoContactInfo(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock, chatwoot: nil}

	// Booking with no guest email or phone
	booking := &domain.Booking{
		ID: uuid.New(),
	}

	err := svc.CreateBookingConversation(context.Background(), booking)
	if err != nil {
		t.Fatalf("CreateBookingConversation should not error with no contact info: %v", err)
	}
}

func TestCreateProjectConversation_NoChatwoot(t *testing.T) {
	mock := newMockRepository()
	svc := &Service{repo: mock, chatwoot: nil}

	project := &domain.Project{
		ID:        uuid.New(),
		ContactID: uuid.New(),
	}

	err := svc.CreateProjectConversation(context.Background(), project)
	if err != nil {
		t.Fatalf("CreateProjectConversation should not error when chatwoot is nil: %v", err)
	}

	// No conversation should be set
	if mock.projectChatwootConvID != 0 {
		t.Error("expected no conversation to be set when chatwoot is nil")
	}
}
