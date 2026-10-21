# Web App - Marketing & Public Portal

## Overview

Next.js 16 marketing site and public-facing portal for Strathcona Summit platform. Part of the monorepo at `apps/web`.

Admin functionality is in a separate app at `apps/admin`.

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
├── contact/              # Public contact form
├── property-management/  # Public service page
├── renovations/          # Public service page
├── about/                # Public about page
└── page.tsx              # Public homepage with entry splash
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

Tailwind CSS v4 with shared brand theme:

```css
@import '@repo/tailwind-config/theme.css';
```

Brand colors: forest, stone, cream, gold, charcoal

## Server Components vs Client Components

- **Default to Server Components** - better performance, no client JS
- **Use Client Components for:**
  - Interactive forms
  - Components using hooks (useState, useEffect)
  - Components using browser APIs
  - Components with event handlers

## Server Actions

Prefer Server Actions over API routes for mutations:

```tsx
// src/lib/actions.ts
'use server'

export async function submitContactForm(formData: FormData) {
  // Validate, process, return result
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
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript check
```

## Key Files

- `src/lib/site.ts` - Site configuration and metadata
- `src/lib/actions.ts` - Server Actions
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
