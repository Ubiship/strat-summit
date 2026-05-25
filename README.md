# Strathcona Summit Solutions

A multi-page brochure website for Strathcona Summit Solutions — a Vancouver Island property management and renovation company.

## Overview

**Company:** Strathcona Summit Solutions (Joel & Amanda)
**Location:** Vancouver Island, BC
**Services:**
- Property Management & Cleaning (Primary)
- Renovations & Construction (Seasonal)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel
- **Forms:** Server Actions + Resend
- **Icons:** Lucide React

## Project Structure

```
strat-summit/
├── app/
│   ├── layout.tsx                 # Root layout (header/footer)
│   ├── page.tsx                   # Homepage
│   ├── globals.css                # Global styles + Tailwind
│   ├── property-management/
│   │   └── page.tsx               # PM & Cleaning services
│   ├── renovations/
│   │   └── page.tsx               # Construction services
│   ├── about/
│   │   └── page.tsx               # Company story
│   └── contact/
│       └── page.tsx               # Contact form
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── hero.tsx
│   ├── service-card.tsx
│   └── contact-form.tsx
├── lib/
│   ├── utils.ts                   # Utility functions (cn helper)
│   └── actions.ts                 # Server Actions (contact form)
├── public/
│   └── images/                    # Static assets
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Site Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, service overview, trust signals |
| `/property-management` | Property Management | Cleaning & caretaking services |
| `/renovations` | Renovations | Construction & renovation services |
| `/about` | About | Joel & Amanda's story, company values |
| `/contact` | Contact | Contact form + business info |

## Brand Guidelines

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep Forest Green | `#1B4332` |
| Secondary | Warm Stone | `#D4C5B5` |
| Accent | Copper/Rust | `#B87333` |
| Background | Off-White | `#FAFAF8` |
| Text | Charcoal | `#2D2D2D` |

### Typography

- **Headings:** Inter (or similar geometric sans)
- **Body:** System font stack

### Brand Direction

"Strathcona" references Strathcona Park on Vancouver Island — rugged mountains, pristine nature. The brand should feel:
- Professional but approachable
- Pacific Northwest aesthetic (nature, mountains, water)
- Trustworthy (they're in people's homes)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd strat-summit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Environment Variables

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=hello@strathconasummit.com
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

The site deploys automatically to Vercel on push to `main`.

### Manual Deployment

```bash
vercel           # Deploy to preview
vercel --prod    # Deploy to production
```

### Domain Configuration

Configure custom domain in Vercel Dashboard → Project → Settings → Domains.

## Content Updates

### Page Content
Edit page content directly in the respective `app/*/page.tsx` files.

### Contact Form
The contact form uses Resend for email delivery. Submissions go to the email configured in `CONTACT_EMAIL`.

## License

Private — Strathcona Summit Solutions
