# Changelog

All notable changes to the Strathcona Summit Solutions platform.

## 2025-06-09

### Changed
- **Monorepo restructure**: Split frontend into `apps/web` (marketing) and `apps/admin` (dashboard)
- **Admin route fix**: Moved admin page to `/dashboard` to resolve route conflict
- **Documentation update**: Updated CLAUDE.md and 00_PROJECT.md to reflect current state

### Added
- Applied Strathcona branding and assets to homepage
- Entry splash component for homepage

## 2025-06-08

### Added
- **Chatwoot webhook handler** with HMAC signature verification
- **Chatwoot sync service** for contact and conversation handling
- **Pending contact workflow**: Contacts from Chatwoot queued for admin review/approval
- Test coverage for Chatwoot webhook handler and sync service

## 2025-06-07

### Added
- **Chatwoot client**: All 6 API methods implemented with tests
- Repository methods for Chatwoot contact linking, booking conversations, project conversations
- `chatwoot_events` audit table for webhook event logging
- `pending_contacts` table and entity for inbound contact review

## 2025-06-06

### Added
- Novu client wired into service layer
- Admin dashboard layout with header, sidebar, notifications
- NovuProvider for in-app notifications

## Earlier Development

### Backend Core (Complete)
- JWT authentication (login, refresh, logout)
- Role-based access control (7 roles: admin, cleaner, PM owner, renovation client, etc.)
- Property CRUD with tier assignment and ownership relationships
- Booking management (Airbnb/VRBO/direct sources, auto-tax calculation)
- Cleaning job auto-creation from bookings
- Staff assignment, clock in/out, status tracking
- Contact management with Chatwoot sync

### Database (26 Migrations)
- Core tables: users, contacts, properties, bookings, cleaning_jobs
- PM tables: property_owners, cleaning_job_staff, owner_statements
- Renovation tables: projects, project_line_items
- Integration tables: chatwoot_events, pending_contacts, ical_feeds

### Frontend (Monorepo)
- Next.js 16 with React 19 and Tailwind CSS v4
- Shared packages: ui, types, tailwind-config, typescript-config
- Marketing site with Strathcona branding
- Admin dashboard scaffold (layout ready, pages pending)

---

## Template History

The frontend was initially based on a Tailwind template. Original template changelog preserved below for reference.

<details>
<summary>Template Changelog (Reference Only)</summary>

## 2025-09-01
- Fix missing `inert` attribute due to React 19 update

## 2025-07-29
- Update to React 19 and Next.js 15.4

## 2025-04-28
- Update template to Tailwind CSS v4.1.4

## 2025-01-23
- Update template to Tailwind CSS v4.0

## 2023-07-31
- Port template to Next.js app router

## 2023-07-13
- Initial release

</details>
