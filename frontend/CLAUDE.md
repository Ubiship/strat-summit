# Frontend - Next.js App

## Overview

Next.js 16 web application for Strathcona Summit platform. Serves multiple user portals with role-based access.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript 5.8

## Portal Structure

Route groups for different user types:

```
src/app/
├── (admin)/        # Joel & Amanda - full platform access
├── (staff)/        # Cleaning staff - mobile-first job views
├── (owner)/        # Property owners - statements, property info
├── (client)/       # Renovation clients - project tracking
├── (subtrade)/     # Subcontractors - assigned work
├── contact/        # Public contact form
├── property-management/  # Public service page
├── renovations/    # Public service page
├── about/          # Public about page
└── page.tsx        # Public homepage
```

## Component Organization

```
src/components/
├── ui/             # Primitive UI components (buttons, inputs, cards)
├── layout/         # Layout components (header, footer, nav)
├── forms/          # Form components with validation
└── [feature]/      # Feature-specific components
```

## Styling

Tailwind CSS v4 with custom brand colors:

```css
/* Brand colors */
--color-forest: #1B4332;    /* Primary green */
--color-stone: #D4C5B5;     /* Neutral warm */
--color-copper: #B87333;    /* Accent */
```

Use Tailwind classes. Avoid inline styles. Use `clsx` for conditional classes.

## Server Components vs Client Components

- **Default to Server Components** - better performance, no client JS
- **Use Client Components for:**
  - Interactive forms
  - Components using hooks (useState, useEffect)
  - Components using browser APIs
  - Components with event handlers

Mark client components with `'use client'` directive at top of file.

## Server Actions

Prefer Server Actions over API routes for mutations:

```tsx
// src/lib/actions.ts
'use server'

export async function submitContactForm(formData: FormData) {
  // Validate, process, return result
}
```

## Authentication Flow

JWT-based auth from Go backend:
1. Login form posts to `/api/auth/login` (proxied to backend)
2. Backend returns access + refresh tokens
3. Store access token in memory, refresh in httpOnly cookie
4. Include token in Authorization header for API calls

## API Calls

Use server-side fetching when possible:

```tsx
// In Server Component
async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await fetch(`${API_URL}/properties/${params.id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    next: { revalidate: 60 }
  }).then(r => r.json())

  return <PropertyView property={property} />
}
```

## Environment Variables

```bash
# Public (available in browser)
NEXT_PUBLIC_API_URL=https://api.strathcona...
NEXT_PUBLIC_SITE_URL=https://strathcona...

# Server-only
RESEND_API_KEY=re_...
CONTACT_EMAIL=hello@...
```

## Commands

```bash
pnpm dev      # Start dev server (port 3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Testing

(To be configured - likely Vitest + React Testing Library)

## Key Files

- `src/lib/site.ts` - Site configuration and metadata
- `src/lib/actions.ts` - Server Actions
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
