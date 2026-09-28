# Public Website Redesign — Design

**Date:** 2026-09-28
**App:** `apps/web`
**Branch:** `feature/web-redesign`
**Approved mockup:** [`assets/2026-09-28-web-redesign-homepage-mockup.html`](assets/2026-09-28-web-redesign-homepage-mockup.html) (open in a browser from this folder; images load from `apps/web/public`)

## Goal

Visually remake the public marketing site so it feels **full bleed, bubbly, and warm**. This is a visual redesign only: the routes, the words on each page, and the order of sections stay the same. Every section is recomposed; nothing is a token swap of the current Studio template.

## Scope

**In scope — every public route in `apps/web`:**

| Route | Source |
|-------|--------|
| `/` | `src/app/page.tsx` |
| `/property-management` | `src/app/property-management/page.tsx` |
| `/renovations` | `src/app/renovations/page.tsx` |
| `/about` | `src/app/about/page.tsx` |
| `/contact` | `src/app/contact/page.tsx` |
| `/process` | `src/app/process/page.tsx` |
| `/blog` and each article | `src/app/blog/page.tsx`, `src/app/blog/wrapper.tsx`, `src/app/blog/*/page.mdx` |
| `/work` and each case study | `src/app/work/page.tsx`, `src/app/work/wrapper.tsx`, `src/app/work/*/page.mdx` |
| Not found | `src/app/not-found.tsx` |

Plus the shared chrome on every page: entry splash, header, full-screen menu, contact band, and footer.

**Out of scope:**

- Copy changes of any kind, including the placeholder copy on Blog, Work, and Process and the items in `docs/PLACEHOLDER_CONTENT_REVIEW.md`. That copy is restyled as-is.
- New routes, removed routes, or changes to which links appear in the menu and footer.
- The admin app (`apps/admin`) — it must look exactly as it does today.
- Owner portal, booking, or any new functionality.
- New photography. The site uses the images already in `apps/web/public` and `src/images`.

## Design direction

Three words, all three required on every page:

- **Full bleed** — photographs and colour bands run edge to edge of the viewport. Content sits in a centred column, but backgrounds never stop at the column.
- **Bubbly** — big radii everywhere: pill buttons and pill navigation, rounded tiles, circular badges, and bands whose top corners are rounded and overlap the band above like stacked sheets.
- **Warm** — sand, apricot, and sun-gold dominate. Photographs are colour-graded toward golden hour. Forest green is the deep contrast colour, not the default background.

## Visual system

### Colour

The existing brand colours stay in `packages/tailwind-config/theme.css`. New warm tokens are **added** to that file; no existing token is changed or removed, so the admin app is unaffected.

| Token | Hex | Use |
|-------|-----|-----|
| `--color-warm-cream` | `#fdf5e8` | Footer, cards on gold, pill nav background |
| `--color-sand` | `#f7e3c4` | Services band, legal strip, hover fills |
| `--color-apricot` | `#f3c98f` | Kicker text on forest, pull-quote band |
| `--color-sun` | `#f2a33a` | Primary buttons, sun dots, contact band, gold tile |
| `--color-ember` | `#d9772f` | Decorative only (sun orb gradient, list markers) |
| `--color-ember-deep` | `#9a4a16` | Kicker text and footer headings on light bands (plain ember fails 4.5:1 on sand and cream) |
| `--color-sun-light` | `#f5b458` | Hover state for sun buttons |
| `--color-forest` (existing) | `#1b4332` | Existing token, unchanged |
| `--color-forest-warm` | `#1f4a35` | "Why" band and forest tiles on the public site |
| `--color-forest-deep` | `#163826` | Page background behind the stacked bands |
| `--color-warm-ink` | `#2a2118` | Body text and headings on light bands |
| `--color-warm-muted` | `#6a5646` | Secondary text on light bands |

Text on photographs and on forest uses `--color-warm-cream`. Button text on `--color-sun` uses `--color-warm-ink`.

### Type

Loaded with `next/font/google` in `apps/web/src/app/layout.tsx` only, replacing Inter on the public site:

- **Fraunces** (variable, axes `opsz`, `wght`, `SOFT`, `WONK`) for all headings, the wordmark, and large numerals. Settings: `SOFT 100`, `WONK 1`, `opsz 144`, weight about 680. Letter-spacing `-0.04em`, line-height `0.9`.
- **Outfit** (weights 500, 600, 700) for body, navigation, buttons, labels, and forms. Body weight is 500.

`--font-display` and `--font-sans` are overridden in a web-only `@theme` block in `apps/web/src/styles/tailwind.css`, after the shared theme import. The admin app keeps Inter.

Scale, from the approved mockup:

| Role | Size |
|------|------|
| Hero headline (h1) | `clamp(64px, 9vw, 136px)` |
| Section headline (h2) | `clamp(52px, 6vw, 88px)` |
| Tile headline (h3) | `clamp(34px, 3.2vw, 46px)` |
| Lede / deck | 19px, line-height 1.5 |
| Body | 16–17px |
| Kicker | 14px, 700, uppercase, `0.08em` tracking, preceded by a 16px sun dot |

### Shape

| Element | Radius |
|---------|--------|
| Band top corners | 64px desktop, 40px below 900px |
| Tiles and large cards | 40–44px |
| Buttons, nav, kicker bubbles, legal strip | fully round (999px) |
| Number badges and sun dots | circles |

**Stacked bands:** every full-bleed section after the hero has rounded top corners and a negative top margin equal to the radius, so it overlaps the section above. Each band carries bottom padding of at least `radius + 96px` so the next band's overlap never covers content.

### Photographs

Photographs are colour-graded warm with a CSS filter, applied by one shared utility class so the grade is consistent:

```css
filter: sepia(0.38) saturate(1.5) hue-rotate(-12deg) brightness(1.06);
```

Full-bleed hero photos also get:

- a left-to-right dark-warm gradient behind the headline, so cream text stays readable over bright sky;
- a bottom-up dark-warm gradient where the next band overlaps;
- a soft sun glow in the upper right (radial gradient, `mix-blend-mode: screen`).

The overlays sit between the image and the text. The hero section creates its own stacking context so its overlays never paint over the band that overlaps it.

The stock model-house image (`public/PropertyManagment.png`) is not used; it works against the warm tone. The mountain hero image stands in on the Property Management page and tile.

### Motion

Keep the existing `FadeIn` and `FadeInStagger` components for section reveals. Respect `prefers-reduced-motion` everywhere, as the current components already do. No new animation library.

## Shared chrome

**Header.** A cream pill floats over the top of each page, inset from the viewport edges, with a soft shadow. Left: the logo mark in a white circle (the icon PNG has heavy padding, so it is cropped by scaling inside an `overflow: hidden` circle) and the "Strathcona Summit" wordmark in Fraunces. Right, on desktop: Property Management, Renovations, and About Us as pill links, and "Get in touch" as a sun pill. Below 900px the three text links are replaced by a "Menu" pill.

**Menu.** The existing full-screen menu keeps the same four links (Property Management, Renovations, About Us, Contact). It becomes a forest panel with the links set as large rounded rows in Fraunces, each with a numbered sun badge. The service-area line and social links sit at the bottom.

**Entry splash.** Keeps its current behaviour: once per browser session, then fades out, shorter with reduced motion. New look: warm cream background, the logo mark in a white circle, the wordmark in Fraunces, and the existing tagline "Reliable Cleaning and Renovation Specialists".

**Contact band.** Replaces `ContactSection` on every page that uses it today. A full-bleed sun band: headline "Ready to simplify property ownership?", the existing paragraph, a forest "Contact us" pill, and a cream rounded card with the Mount Washington service area.

**Footer.** A full-bleed cream band. The wordmark and mark, then the existing Services, Company, and Connect groups with ember headings, then a sand pill strip with the copyright and "Mount Washington · Comox Valley".

## Pages

Each page arranges the shared materials in its own composition. Section order and copy follow the current source file for that route.

### Home (`/`)

As in the approved mockup:

1. **Hero** — full-viewport, full-bleed warm-graded mountain photo. Kicker bubble "Mount Washington", the h1, then the lede on the left and the two pill actions ("Get in touch", "View services") on the right.
2. **Services** — sand band. Kicker and h2 on the left, deck on the right. Three rounded tiles: Property Management (photo tile, largest), Property Support Services (solid sun tile), Renovations & Improvements (photo tile). Each tile has a numbered circle badge and a "Learn more" pill.
3. **Why owners choose us** — forest band with a soft sun glow in the corner. Headline left, deck right, then three rounded translucent cards, each with a sun orb.
4. **Contact band**, then the **footer**.

### Property Management (`/property-management`)

1. Full-bleed warm hero with the page kicker, title, and intro.
2. The three tiers as three rounded tiles in sand, sun, and forest. Tier 3 (full property management) is the widest tile.
3. "What every visit covers" — the six inclusions as a cluster of large cream pills on a sand band.
4. "Works with how you already book" — forest band with three rounded cards (Calendar sync, Guest-ready standard, Owner visibility).
5. The full-bleed mountain photo that currently closes the page, as a warm-graded band.
6. Contact band and footer.

### Renovations (`/renovations`)

1. Full-bleed warm hero using the renovation photo.
2. Estimate, Contract, Build, and Complete as a row of four numbered sun circles joined by a line, each with its paragraph beneath. Stacks vertically on mobile.
3. "What we typically take on" — the four project types as rounded tiles on a sand band.
4. Joel's quote as a large Fraunces pull quote on an apricot band, with the renovation photo in a rounded frame.
5. Contact band and footer.

### About (`/about`)

1. Warm full-bleed opening band with "Built on trust, rooted on the Island." and the three intro paragraphs.
2. The three stats (2, 3, 1) as oversized Fraunces numerals in warm ink, each inside a large sun disc on sand. (Sun-coloured numerals directly on sand fail 3:1.)
3. "Our values" — forest band with the three values as rounded cards.
4. Leadership — Joel and Amanda as large rounded portrait tiles. The placeholder photo and the note about replacing it stay until real headshots are provided.
5. Contact band and footer.

### Contact (`/contact`)

1. Short warm hero band with "Let's talk about your property." and the intro.
2. The form on a large cream sheet with rounded, pill-shaped inputs and a sun submit pill. The form's behaviour and server action are unchanged.
3. Beside it (below on mobile), a sand card with service area, email and phone, and social links.
4. Footer. This page has no contact band, as today.

### Blog, Work, Process, and Not found

Same materials in simpler layouts:

- **Blog index and Work index** — warm hero band, then entries as rounded cards on sand.
- **Article and case-study pages** (`wrapper.tsx`) — warm header band with title and meta, content on a cream sheet with the existing typography styles re-tuned to the new fonts and colours, then the related-entries links as rounded cards.
- **Process** — warm hero, then Discover, Build, and Deliver as alternating rounded photo tiles and text, then the values grid on a forest band.
- **Not found** — a single warm band with the message and a sun pill back home.

Placeholder copy on these pages is restyled, not rewritten.

## Implementation boundaries

- **Admin isolation.** Only additive changes to `packages/tailwind-config/theme.css`. Font variables are overridden in `apps/web` only. After the change, `apps/admin` must build and render exactly as before.
- **Bespoke pages, shared primitives.** Pages do not share a section template. They share a small set of primitives: the band (full-bleed, rounded top, overlap), pill button and link variants, kicker, number badge, the warm photo class, and the chrome. Existing template components that no longer fit (`StylizedImage`, `GridPattern`, `GrayscaleTransitionImage`, `Border`, and so on) are replaced where the new layouts need something different, and deleted only once nothing imports them.
- **Server components by default.** Only the header, menu, splash, and contact form stay client components, as today.
- **Images** keep using `next/image`. The warm grade is CSS, so the source files are not edited.

## Accessibility

- Cream text over photographs must meet WCAG AA (4.5:1 for body text, 3:1 for large headings) against the graded, overlaid image. Check the brightest part of each hero behind its text.
- `--color-warm-ink` on `--color-sun` and on `--color-sand` must meet AA for body text.
- Every pill link and button has a visible focus ring (a 2px ring in `--color-warm-ink` or `--color-warm-cream`, depending on the background).
- The menu keeps its current keyboard behaviour: focus moves into the panel on open and returns to the toggle on close.
- Decorative orbs, sun dots, and glows are hidden from assistive technology.
- `prefers-reduced-motion` shortens the splash and disables reveal motion.

## Responsive behaviour

- Breakpoint for layout collapse: 900px. Below it, multi-column grids become single columns, band radius drops to 40px, header text links become the Menu pill, and tiles lose their fixed minimum heights.
- The hero stays full-viewport on mobile, with the headline scaling down through its `clamp`.
- Check at 375px, 768px, 1280px, and 1920px widths.

## Verification

- `pnpm --filter web lint`, `pnpm --filter web typecheck`, and `pnpm --filter web build` pass.
- `pnpm --filter admin build` passes, and the admin login and dashboard look unchanged.
- Every route in the scope table is opened in a browser at the four widths above. For each: the words and section order match the pre-redesign page, bands overlap cleanly with no content hidden under a band's rounded top, and hero text is readable over its photo.
- Keyboard pass on the header, menu, and contact form.
- The entry splash appears once per session and respects reduced motion.
