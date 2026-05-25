# Strathcona Summit Solutions

A multi-page marketing site for Strathcona Summit Solutions — a Vancouver Island property management and renovation company.

## Overview

**Company:** Strathcona Summit Solutions (Joel & Amanda)  
**Location:** Vancouver Island, BC  
**Services:** Property Management & Cleaning · Renovations & Construction

Built on the [Tailwind Plus Studio](https://tailwindcss.com/plus) template (Next.js + Tailwind v4 + Framer Motion).

## Site map

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/property-management` | PM & cleaning services |
| `/renovations` | Construction services |
| `/about` | Company story |
| `/contact` | Contact form |

Legacy template routes (`/blog`, `/work`, `/process`) remain in the build; `/process` redirects to `/property-management`.

## Brand

| Role | Hex |
|------|-----|
| Primary (forest) | `#1B4332` |
| Secondary (stone) | `#D4C5B5` |
| Accent (copper) | `#B87333` |
| Background (cream) | `#FAFAF8` |

Site copy and contact details live in `src/lib/site.ts`.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=hello@strathconasummit.com
RESEND_FROM_EMAIL=Strathcona Summit <hello@strathconasummit.com>
NEXT_PUBLIC_SITE_URL=https://strathconasummit.com
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Related docs

Operational platform specs (Go backend, portals) are in `00_PROJECT.md` and sibling docs — separate from this marketing site.

## License

Private — Strathcona Summit Solutions. Studio template licensed under [Tailwind Plus](https://tailwindcss.com/plus/license).
