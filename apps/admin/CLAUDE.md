# Admin App - Operations Portal

## Overview

Next.js 16 admin portal for Strathcona Summit Solutions. Separate Vercel deployment from the marketing site. Part of the monorepo at `apps/admin`.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 (shared theme from `@repo/tailwind-config`)
- TypeScript 5.8

## Shared Packages

This app uses shared packages from the monorepo:
- `@repo/ui` - Shared UI components (Button, Container, FadeIn)
- `@repo/types` - TypeScript types matching backend domain
- `@repo/tailwind-config` - Brand colors and Tailwind theme

## Route Structure

```
src/app/
├── login/           # Login page (public)
├── dashboard/       # Main dashboard (protected)
├── properties/      # Property CRUD
├── bookings/        # Booking management
├── jobs/            # Cleaning job management
├── contacts/        # Contact management
└── page.tsx         # Redirect to dashboard or login
```

## Authentication

Custom JWT-based auth from Go backend:
1. Login form posts to backend `/api/auth/login`
2. Backend returns access + refresh tokens
3. Access token stored in sessionStorage (client-side)
4. Refresh token stored in httpOnly cookie (server-side)
5. Protected routes check auth via AuthProvider

## API Client

The `@/lib/api.ts` provides a typed API client:

```tsx
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

// Set token before making requests
api.setToken(getAccessToken());

// Make typed requests
const properties = await api.getProperties();
const booking = await api.getBooking(id);
```

## Components

Admin-specific components in `src/components/`:
- `Sidebar` - Navigation sidebar
- `Header` - Top header with notifications
- `DataTable` - Generic data table component
- `StatsCard` - Dashboard stat card
- `NotificationBell` - Novu notifications

## Providers

- `AuthProvider` - Authentication context
- `NovuProvider` - Novu notifications

## Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Novu notifications (optional)
NEXT_PUBLIC_NOVU_APP_ID=
```

## Commands

```bash
pnpm dev          # Start dev server (port 3001)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript check
```

## Key Files

- `src/lib/api.ts` - Backend API client
- `src/lib/auth.ts` - Client-side auth utilities
- `src/lib/actions.ts` - Server Actions (login, logout)
- `src/providers/AuthProvider.tsx` - Auth context
- `src/components/Sidebar.tsx` - Navigation
