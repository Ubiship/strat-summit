# Public Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remake every public page of `apps/web` in the approved full-bleed, bubbly, warm style without changing any page's words or section order, and without changing the admin app.

**Architecture:** Additive warm colour tokens go into the shared Tailwind theme; fonts, custom utilities, and a `split` breakpoint are defined only in `apps/web`. A small set of primitives (`Band`, `Button`, `Kicker`, `NumberBadge`, `SectionHead`, `PageHero`, `PhotoBand`, `ValueCards`) is shared, and each page composes them in its own layout. A copy guard script snapshots the words inside `<main>` on every route before any change and is re-run after every task, so no task can silently change copy.

**Tech Stack:** Next.js 16 (App Router, webpack build), React 19, Tailwind CSS v4, framer-motion 12, `next/font/google` (Fraunces, Outfit), Node 24 for the copy guard script.

**Spec:** [`docs/superpowers/specs/2026-09-28-web-redesign-design.md`](../specs/2026-09-28-web-redesign-design.md)
**Approved mockup:** [`docs/superpowers/specs/assets/2026-09-28-web-redesign-homepage-mockup.html`](../specs/assets/2026-09-28-web-redesign-homepage-mockup.html)

---

## Working notes for the engineer

- Work on branch `feature/web-redesign`. The working tree also contains unrelated, uncommitted backend changes (`backend/...`) and an untracked `docs/superpowers/specs/2026-09-28-customer-cleaning-booking-design.md`. **Never** `git add -A` or `git add .`; always add the exact paths listed in each commit step.
- Code style in `apps/web`: no semicolons, single quotes, two-space indent, `let` is common, imports grouped (external, blank line, `@/` imports sorted alphabetically). Prettier with `prettier-plugin-tailwindcss` is installed; you may run `pnpm --filter ./apps/web exec prettier --write <files>` on files you touch.
- Keep the web dev server running in its own terminal for the whole plan: `pnpm --filter ./apps/web dev` (port 3000). The copy guard fetches pages from it.
- `/process` has a permanent redirect to `/property-management` in `apps/web/next.config.mjs`. The Process page is still restyled (Task 13), but it cannot be opened in a browser and is not part of the copy guard.
- Before this plan, `pnpm --filter ./apps/web lint` already reports one error: `react-hooks/set-state-in-effect` in `EntrySplash.tsx`. In Tasks 1–3, that single error is expected and any other lint error is not. Task 4 rewrites `EntrySplash` and removes it; from Task 4 on, lint must be clean.
- Between Task 3 and Task 13, pages that have not been redesigned yet will look broken (old dark text on the new dark page background). That is expected; only judge the pages a task has finished.
- Tailwind v4 notes used throughout: arbitrary values like `text-[1.1875rem]/[1.5]`, fractional spacing like `px-4.5`, `size-13`, opacity modifiers like `bg-warm-cream/8`, and the custom `split:` variant (≥ 900px) defined in Task 2.
- Reduced motion (changed during Task 7): `MotionConfig reducedMotion="user"` lives in `apps/web/src/components/MotionProvider.tsx`, wrapped around `{children}` in `app/layout.tsx`, so it also covers the not-found page. `RootLayout` no longer renders `MotionConfig`, and `FadeIn` must not call `useReducedMotion` (it made server and client markup differ). Ignore the `MotionConfig` lines in the Task 4 `RootLayout` listing.
- `PhotoBand` uses its own lighter `band-shade` utility; `hero-shade` is for heroes with text on them.
- Contact (changed during Task 9): the form band is `apricot`, not `cream`, so the cream footer's rounded edge shows. The form sheet is `bg-warm-cream`, inputs and the radio box are white, and input and radio borders are `border-warm-ink/50` (WCAG 1.4.11 non-text contrast), with an ink centre dot on the checked radio.
- Two small deviations from the spec's wording, required by the spec's own accessibility section, are applied to the spec in Task 2: kicker text on light bands uses a new darker `--color-ember-deep` (plain ember fails 4.5:1), and the About stats are ink numerals inside sun discs (sun numerals on sand fail 3:1).

## File structure

**Created**

| File | Responsibility |
|------|----------------|
| `apps/web/scripts/check-copy.mjs` | Copy guard: fetches every public route, extracts the words inside `<main>`, compares with the baseline |
| `apps/web/tests/copy-baseline/*.txt` | One word list per route, captured before the redesign |
| `apps/web/src/styles/warm.css` | Web-only theme overrides (fonts, `split` breakpoint), `--band-radius`, and custom utilities |
| `apps/web/src/components/Band.tsx` | Full-bleed section with rounded top that overlaps the section above |
| `apps/web/src/components/Kicker.tsx` | Small uppercase label with a sun dot; `bubble` variant for use over photos |
| `apps/web/src/components/NumberBadge.tsx` | Decorative numbered circle (hidden from assistive technology) |
| `apps/web/src/components/SectionHead.tsx` | Kicker + h2 on the left, deck paragraph on the right |
| `apps/web/src/components/PageHero.tsx` | Full-bleed hero, with a warm-graded photo or a warm gradient |
| `apps/web/src/components/PhotoBand.tsx` | Full-bleed photo band that overlaps like a band |
| `apps/web/src/components/ValueCards.tsx` | Three-column rounded cards with sun orbs, for forest bands |

**Rewritten:** `Button.tsx`, `Container.tsx`, `Logo.tsx`, `Offices.tsx`, `SocialMedia.tsx` (component only), `Footer.tsx`, `ContactSection.tsx`, `RootLayout.tsx`, `EntrySplash.tsx`, `ContactForm.tsx`, `Border.tsx`, `Blockquote.tsx`, `StatList.tsx`, `TagList.tsx`, `List.tsx`, `PageLinks.tsx`, `Testimonial.tsx`, `MDXComponents.tsx`, every page file in scope, `app/layout.tsx`, `styles/tailwind.css`, `styles/base.css`.

**Modified:** `packages/tailwind-config/theme.css` (additive tokens), `apps/web/src/styles/typography.css` (colours), `apps/web/package.json` (scripts), the spec (two accessibility corrections).

**Deleted (Task 14):** `PageIntro.tsx`, `SectionIntro.tsx`, `GridList.tsx`, `StylizedImage.tsx`, `GridPattern.tsx`, `GrayscaleTransitionImage.tsx`.

---

### Task 1: Copy guard and baseline

**Files:**
- Create: `apps/web/scripts/check-copy.mjs`
- Create: `apps/web/tests/copy-baseline/*.txt` (generated)
- Modify: `apps/web/package.json` (scripts)

- [ ] **Step 1: Write the copy guard script**

Create `apps/web/scripts/check-copy.mjs`:

```js
// Usage: with `pnpm --filter ./apps/web dev` running, `node scripts/check-copy.mjs` (compare) or `--update` (save baseline).
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const baselineDir = path.join(appDir, 'tests', 'copy-baseline')
const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const update = process.argv.includes('--update')

async function mdxRoutes(section) {
  let dir = path.join(appDir, 'src', 'app', section)
  let entries = await readdir(dir, { withFileTypes: true })
  let routes = []
  for (let entry of entries) {
    if (!entry.isDirectory()) continue
    let files = await readdir(path.join(dir, entry.name))
    if (files.includes('page.mdx')) routes.push(`/${section}/${entry.name}`)
  }
  return routes.sort()
}

const entities = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
}

export function extractWords(html) {
  let text =
    html.match(/<main[\s\S]*?<\/main>/)?.[0] ??
    html.match(/<body[\s\S]*?<\/body>/)?.[0] ??
    html
  text = text
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<template[\s\S]*?<\/template>/g, ' ')
  let previous
  do {
    previous = text
    text = text.replace(
      /<(\w+)\b[^>]*\baria-hidden="true"[^>]*>[^<]*<\/\1>/g,
      ' ',
    )
  } while (text !== previous)
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (match) => entities[match])
  return text.match(/[\p{L}\p{N}]+(?:['’]\p{L}+)*/gu) ?? []
}

function baselineFile(route) {
  let name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '__')
  return path.join(baselineDir, `${name}.txt`)
}

const routes = [
  '/',
  '/property-management',
  '/renovations',
  '/about',
  '/contact',
  '/blog',
  ...(await mdxRoutes('blog')),
  '/work',
  ...(await mdxRoutes('work')),
  '/this-page-does-not-exist',
]

await mkdir(baselineDir, { recursive: true })

let failures = 0
for (let route of routes) {
  let html
  try {
    html = await (await fetch(new URL(route, baseUrl))).text()
  } catch {
    console.error(
      `Could not reach ${baseUrl}. Start the dev server first: pnpm --filter ./apps/web dev`,
    )
    process.exit(1)
  }
  let words = extractWords(html).join(' ')

  if (update) {
    await writeFile(baselineFile(route), `${words}\n`)
    console.log(`saved ${route}`)
    continue
  }

  let expected = (await readFile(baselineFile(route), 'utf8')).trim()
  if (expected === words) {
    console.log(`ok    ${route}`)
    continue
  }

  failures++
  let a = expected.split(' ')
  let b = words.split(' ')
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  let from = Math.max(0, i - 8)
  console.log(`FAIL  ${route}`)
  console.log(`  first difference at word ${i}`)
  console.log(`  expected: …${a.slice(from, i + 12).join(' ')}`)
  console.log(`  actual:   …${b.slice(from, i + 12).join(' ')}`)
}

if (failures > 0) {
  console.error(`\n${failures} route(s) changed copy`)
  process.exit(1)
}
```

- [ ] **Step 2: Add package scripts**

In `apps/web/package.json`, replace the `scripts` block with:

```json
  "scripts": {
    "dev": "next dev --port 3000 --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "check:copy": "node scripts/check-copy.mjs",
    "check:copy:update": "node scripts/check-copy.mjs --update"
  },
```

- [ ] **Step 3: Confirm the guard fails without a baseline**

With the dev server running (`pnpm --filter ./apps/web dev`, wait for `Ready`), run:

```bash
pnpm --filter ./apps/web check:copy
```

Expected: the script exits with an `ENOENT` error reading `tests/copy-baseline/home.txt`, because no baseline exists yet.

- [ ] **Step 4: Capture the baseline from the current, unmodified site**

```bash
pnpm --filter ./apps/web check:copy:update
```

Expected: 14 lines, `saved /` through `saved /this-page-does-not-exist` (7 fixed routes, 3 blog articles, 3 case studies, and the 404 route).

Sanity-check two files:

```bash
head -c 200 apps/web/tests/copy-baseline/home.txt; echo
head -c 200 apps/web/tests/copy-baseline/contact.txt; echo
```

Expected: `home.txt` starts with `Mount Washington Property management from a team that lives here We built Strathcona Summit Solutions to give homeowners`. `contact.txt` starts with `Contact Let's talk about your property Tell us a bit about your property`.

- [ ] **Step 5: Confirm the guard passes against the unchanged site**

```bash
pnpm --filter ./apps/web check:copy
```

Expected: 14 lines starting with `ok`, exit code 0.

- [ ] **Step 6: Commit**

```bash
git add apps/web/scripts/check-copy.mjs apps/web/package.json apps/web/tests/copy-baseline
git commit -m "test(web): add page copy guard for the redesign"
```

---

### Task 2: Tokens, fonts, utilities, and focus styles

**Files:**
- Modify: `packages/tailwind-config/theme.css` (append tokens)
- Create: `apps/web/src/styles/warm.css`
- Modify: `apps/web/src/styles/tailwind.css`
- Modify: `apps/web/src/styles/base.css`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `docs/superpowers/specs/2026-09-28-web-redesign-design.md`

- [ ] **Step 1: Add warm tokens to the shared theme (additive only)**

In `packages/tailwind-config/theme.css`, replace:

```css
  --font-display-length: 2;
}
```

with:

```css
  --font-display-length: 2;

  /* Warm palette for the public site (additive; apps/admin does not use these) */
  --color-warm-cream: #fdf5e8;
  --color-sand: #f7e3c4;
  --color-apricot: #f3c98f;
  --color-sun: #f2a33a;
  --color-sun-light: #f5b458;
  --color-ember: #d9772f;
  --color-ember-deep: #9a4a16;
  --color-forest-warm: #1f4a35;
  --color-forest-deep: #163826;
  --color-warm-ink: #2a2118;
  --color-warm-muted: #6a5646;
}
```

- [ ] **Step 2: Create the web-only theme and utilities**

Create `apps/web/src/styles/warm.css`:

```css
@theme {
  --font-sans: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-fraunces), Georgia, ui-serif, serif;
  --font-display--font-variation-settings: 'SOFT' 100, 'WONK' 1, 'opsz' 144;
  --breakpoint-split: 56.25rem;
}

:root {
  --band-radius: 2.5rem;
}

@media (width >= 56.25rem) {
  :root {
    --band-radius: 4rem;
  }
}

@utility type-display {
  font-family: var(--font-display);
  font-variation-settings: var(--font-display--font-variation-settings);
  font-weight: 680;
  letter-spacing: -0.04em;
  line-height: 0.9;
}

@utility photo-warm {
  filter: sepia(0.38) saturate(1.5) hue-rotate(-12deg) brightness(1.06);
}

@utility hero-shade {
  background:
    linear-gradient(
      180deg,
      rgb(255 150 60 / 0.1) 0%,
      rgb(40 22 10 / 0) 45%,
      rgb(40 22 10 / 0.62) 100%
    ),
    linear-gradient(
      90deg,
      rgb(60 30 10 / 0.52) 0%,
      rgb(60 30 10 / 0.22) 45%,
      rgb(60 30 10 / 0) 72%
    );
}

@utility hero-glow {
  background: radial-gradient(
    40% 45% at 88% 6%,
    rgb(255 200 110 / 0.75),
    rgb(255 170 80 / 0.22) 45%,
    rgb(255 170 80 / 0) 75%
  );
  mix-blend-mode: screen;
}

@utility hero-fill {
  background:
    radial-gradient(
      55% 70% at 85% 5%,
      rgb(255 201 120 / 0.9),
      rgb(255 201 120 / 0) 65%
    ),
    linear-gradient(160deg, #e98b3a 0%, #c4612a 48%, #1f4a35 100%);
}

@utility tile-shade {
  background: linear-gradient(
    180deg,
    rgb(42 24 10 / 0) 30%,
    rgb(42 24 10 / 0.78) 100%
  );
}

@utility sun-glow {
  background: radial-gradient(
    circle,
    rgb(242 163 58 / 0.55),
    rgb(242 163 58 / 0) 68%
  );
}

@utility sun-orb {
  background: radial-gradient(
    circle at 35% 30%,
    #ffd58a,
    var(--color-sun) 60%,
    var(--color-ember)
  );
  box-shadow: 0 14px 30px rgb(242 163 58 / 0.3);
}
```

- [ ] **Step 3: Import it after the shared theme**

Replace the contents of `apps/web/src/styles/tailwind.css` with:

```css
@import 'tailwindcss';
@import '@repo/tailwind-config/theme.css';
@import './warm.css';
@import './base.css';
@import './typography.css' layer(components);
```

- [ ] **Step 4: Add the global focus ring**

Replace the contents of `apps/web/src/styles/base.css` with:

```css
@layer base {
  :where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }
}
```

- [ ] **Step 5: Load Fraunces and Outfit instead of Inter**

Replace the contents of `apps/web/src/app/layout.tsx` with:

```tsx
import { type Metadata } from 'next'
import { Fraunces, Outfit } from 'next/font/google'

import { site } from '@/lib/site'
import '@/styles/tailwind.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
})

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s - ${site.shortName}`,
    default: `${site.shortName} - Property Management & Renovations`,
  },
  description: site.description,
  icons: {
    icon: site.logos.icon,
    apple: site.logos.icon,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.shortName,
    images: [{ url: site.logos.full, alt: site.name }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} h-full bg-forest-deep text-base antialiased`}
    >
      <body className="flex min-h-full flex-col bg-forest-deep font-sans text-warm-ink">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Record the two accessibility corrections in the spec**

In `docs/superpowers/specs/2026-09-28-web-redesign-design.md`, replace:

```markdown
| `--color-ember` | `#d9772f` | Kicker text on light bands, footer headings |
```

with:

```markdown
| `--color-ember` | `#d9772f` | Decorative only (sun orb gradient, list markers) |
| `--color-ember-deep` | `#9a4a16` | Kicker text and footer headings on light bands (plain ember fails 4.5:1 on sand and cream) |
| `--color-sun-light` | `#f5b458` | Hover state for sun buttons |
```

and replace:

```markdown
2. The three stats (2, 3, 1) as oversized sun-coloured Fraunces numerals on sand.
```

with:

```markdown
2. The three stats (2, 3, 1) as oversized Fraunces numerals in warm ink, each inside a large sun disc on sand. (Sun-coloured numerals directly on sand fail 3:1.)
```

- [ ] **Step 7: Verify types, lint, build, admin, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web build
pnpm --filter ./apps/admin build
pnpm --filter ./apps/web check:copy
```

Expected: typecheck and lint print no errors; both builds finish with `✓ Compiled successfully` (or Next's equivalent success line) and exit 0; the copy guard prints 14 `ok` lines. If the dev server was started before this task, restart it first so the new fonts load.

- [ ] **Step 8: Commit**

```bash
git add packages/tailwind-config/theme.css apps/web/src/styles/warm.css apps/web/src/styles/tailwind.css apps/web/src/styles/base.css apps/web/src/app/layout.tsx docs/superpowers/specs/2026-09-28-web-redesign-design.md
git commit -m "feat(web): add warm palette, Fraunces and Outfit, and redesign utilities"
```

---

### Task 3: Layout primitives

**Files:**
- Modify: `apps/web/src/components/Container.tsx`
- Modify: `apps/web/src/components/Button.tsx`
- Create: `apps/web/src/components/Kicker.tsx`
- Create: `apps/web/src/components/NumberBadge.tsx`
- Create: `apps/web/src/components/Band.tsx`
- Create: `apps/web/src/components/SectionHead.tsx`
- Create: `apps/web/src/components/PageHero.tsx`
- Create: `apps/web/src/components/ValueCards.tsx`
- Modify: `apps/web/src/components/RootLayout.tsx` (one line, until Task 4 rewrites it)

- [ ] **Step 1: Rewrite `Container`**

Replace the contents of `apps/web/src/components/Container.tsx` with:

```tsx
import clsx from 'clsx'

type ContainerProps<T extends React.ElementType> = {
  as?: T
  className?: string
  children: React.ReactNode
}

export function Container<T extends React.ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps<T>> &
  ContainerProps<T>) {
  let Component = as ?? 'div'

  return (
    <Component
      className={clsx('mx-auto w-full max-w-[75rem] px-6', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
```

- [ ] **Step 2: Rewrite `Button` as a pill with tones**

Replace the contents of `apps/web/src/components/Button.tsx` with:

```tsx
import Link from 'next/link'
import clsx from 'clsx'

// Filled pills draw the focus ring inside, where it contrasts with the fill;
// outside, it would sit on whatever band the button is placed on.
const tones = {
  sun: 'bg-sun text-warm-ink hover:bg-sun-light focus-visible:-outline-offset-4',
  forest:
    'bg-forest-warm text-warm-cream hover:bg-forest focus-visible:-outline-offset-4',
  cream:
    'bg-warm-cream text-warm-ink hover:bg-white focus-visible:-outline-offset-4',
  glass:
    'bg-warm-cream/15 text-warm-cream ring-2 ring-warm-cream/60 ring-inset hover:bg-warm-cream/25',
  outline: 'text-warm-ink ring-2 ring-warm-ink ring-inset hover:bg-warm-ink/5',
}

const sizes = {
  md: 'px-6 py-4 text-base',
  sm: 'px-4.5 py-3 text-[0.9375rem]',
}

export type ButtonTone = keyof typeof tones

type ButtonProps = {
  tone?: ButtonTone
  size?: keyof typeof sizes
  arrow?: boolean
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
)

export function Button({
  tone = 'sun',
  size = 'md',
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2.5 rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
    tones[tone],
    sizes[size],
    className,
  )

  let inner = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-current/15 text-sm"
        >
          →
        </span>
      )}
    </>
  )

  if (typeof props.href === 'undefined') {
    return (
      <button className={className} {...props}>
        {inner}
      </button>
    )
  }

  return (
    <Link className={className} {...props}>
      {inner}
    </Link>
  )
}
```

- [ ] **Step 3: Keep `RootLayout` compiling against the new `Button`**

In `apps/web/src/components/RootLayout.tsx`, replace:

```tsx
          <Button href="/contact" invert={invert}>
```

with:

```tsx
          <Button href="/contact" tone={invert ? 'cream' : 'sun'} size="sm">
```

- [ ] **Step 4: Create `Kicker`**

Create `apps/web/src/components/Kicker.tsx`:

```tsx
import clsx from 'clsx'

export function Kicker({
  as: Component = 'p',
  tone = 'light',
  bubble = false,
  className,
  children,
}: {
  as?: 'p' | 'h2' | 'h3' | 'span'
  tone?: 'light' | 'dark'
  bubble?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (bubble) {
    return (
      <Component
        className={clsx(
          'inline-flex items-center gap-2.5 rounded-full bg-[#2a180a]/40 py-2.5 pr-4.5 pl-2.5 text-sm font-bold tracking-[0.04em] text-warm-cream backdrop-blur-md',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="size-5.5 flex-none rounded-full bg-sun shadow-[0_0_0_6px_rgb(242_163_58/0.3)]"
        />
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={clsx(
        'flex items-center gap-2.5 text-sm font-bold tracking-[0.08em] uppercase',
        tone === 'dark' ? 'text-apricot' : 'text-ember-deep',
        className,
      )}
    >
      <span aria-hidden="true" className="size-4 flex-none rounded-full bg-sun" />
      {children}
    </Component>
  )
}
```

- [ ] **Step 5: Create `NumberBadge`**

Create `apps/web/src/components/NumberBadge.tsx`:

```tsx
import clsx from 'clsx'

const tones = {
  cream: 'bg-warm-cream text-warm-ink',
  ink: 'bg-warm-ink text-warm-cream',
  sun: 'bg-sun text-warm-ink',
}

const sizes = {
  md: 'size-14 text-base',
  lg: 'size-16 text-lg',
}

export function NumberBadge({
  value,
  tone = 'cream',
  size = 'md',
  className,
}: {
  value: number
  tone?: keyof typeof tones
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid flex-none place-items-center rounded-full font-extrabold',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {String(value).padStart(2, '0')}
    </span>
  )
}
```

- [ ] **Step 6: Create `Band`**

Create `apps/web/src/components/Band.tsx`:

```tsx
import clsx from 'clsx'

const tones = {
  cream: 'bg-warm-cream text-warm-ink',
  sand: 'bg-sand text-warm-ink',
  apricot: 'bg-apricot text-warm-ink',
  sun: 'bg-sun text-warm-ink',
  forest: 'bg-forest-warm text-warm-cream',
}

export type BandTone = keyof typeof tones

export function Band({
  tone,
  as: Component = 'section',
  last = false,
  className,
  children,
}: {
  tone: BandTone
  as?: 'section' | 'footer' | 'div'
  last?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={clsx(
        'relative z-10 mt-[calc(var(--band-radius)*-1)] rounded-t-[var(--band-radius)] pt-24 split:pt-28',
        last ? 'pb-10' : 'pb-[calc(var(--band-radius)+6rem)]',
        tones[tone],
        className,
      )}
    >
      {children}
    </Component>
  )
}
```

- [ ] **Step 7: Create `SectionHead`**

Create `apps/web/src/components/SectionHead.tsx`:

```tsx
import clsx from 'clsx'

import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

export function SectionHead({
  kicker,
  title,
  tone = 'light',
  className,
  children,
}: {
  kicker?: string
  title: string
  tone?: 'light' | 'dark'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <FadeIn
      className={clsx(
        'grid gap-6 split:grid-cols-[1.1fr_0.9fr] split:items-end split:gap-10',
        className,
      )}
    >
      <div>
        {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
        <h2
          className={clsx(
            'type-display text-[clamp(3.25rem,6vw,5.5rem)] text-balance',
            kicker && 'mt-4',
          )}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={clsx(
            'max-w-[38ch] space-y-4 text-[1.1875rem]/[1.5]',
            tone === 'dark' ? 'text-[#f1dfc6]' : 'text-warm-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
```

- [ ] **Step 8: Create `PageHero`**

Create `apps/web/src/components/PageHero.tsx`:

```tsx
import Image from 'next/image'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

const heights = {
  full: 'min-h-svh',
  page: 'min-h-[38rem] split:min-h-[46rem]',
  short: 'min-h-[30rem] split:min-h-[34rem]',
}

const titleSizes = {
  full: 'max-w-[11ch] text-[clamp(4rem,9vw,8.5rem)]',
  page: 'max-w-[14ch] text-[clamp(3.25rem,7vw,6.5rem)]',
  short: 'max-w-[16ch] text-[clamp(3rem,6vw,5.5rem)]',
}

export function PageHero({
  kicker,
  title,
  image,
  size = 'page',
  actions,
  children,
}: {
  kicker?: string
  title: string
  image?: { src: string; alt: string; position?: string }
  size?: keyof typeof heights
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section
      className={clsx(
        'relative isolate z-0 flex flex-col overflow-hidden text-warm-cream',
        heights[size],
      )}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="photo-warm -z-20 object-cover"
          style={{ objectPosition: image.position ?? 'center 42%' }}
        />
      ) : (
        <div aria-hidden="true" className="hero-fill absolute inset-0 -z-20" />
      )}
      <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />
      <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />

      <Container className="mt-auto pt-40 pb-[calc(var(--band-radius)+4.5rem)]">
        <FadeIn>
          {kicker && <Kicker bubble>{kicker}</Kicker>}
          <h1
            className={clsx(
              'type-display text-balance [text-shadow:0_4px_30px_rgb(42_24_10/0.25)]',
              kicker && 'mt-5.5',
              titleSizes[size],
            )}
          >
            {title}
          </h1>
          {(children || actions) && (
            <div className="mt-8 flex flex-col gap-8 split:flex-row split:items-end split:justify-between">
              {children && (
                <div className="max-w-[44ch] space-y-5 text-[1.1875rem]/[1.5] text-[#fbeedd]">
                  {children}
                </div>
              )}
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          )}
        </FadeIn>
      </Container>
    </section>
  )
}
```

- [ ] **Step 9: Create `ValueCards`**

Create `apps/web/src/components/ValueCards.tsx`:

```tsx
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

// Styled for forest bands: translucent cream cards, cream headings.
export function ValueCards({
  items,
}: {
  items: Array<{ title: string; description: string }>
}) {
  return (
    <FadeInStagger className="mt-14 grid gap-4.5 split:grid-cols-3">
      {items.map((item) => (
        <FadeIn
          key={item.title}
          className="flex min-h-[16rem] flex-col rounded-[2.5rem] bg-warm-cream/8 p-8"
        >
          <span aria-hidden="true" className="sun-orb size-16 flex-none rounded-full" />
          <h3 className="type-display mt-12 text-[2.125rem]">{item.title}</h3>
          <p className="mt-2.5 text-base/[1.5] text-[#f1dfc6]">
            {item.description}
          </p>
        </FadeIn>
      ))}
    </FadeInStagger>
  )
}
```

- [ ] **Step 10: Verify**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no type or lint errors; 14 `ok` lines.

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/components/Container.tsx apps/web/src/components/Button.tsx apps/web/src/components/RootLayout.tsx apps/web/src/components/Kicker.tsx apps/web/src/components/NumberBadge.tsx apps/web/src/components/Band.tsx apps/web/src/components/SectionHead.tsx apps/web/src/components/PageHero.tsx apps/web/src/components/ValueCards.tsx
git commit -m "feat(web): add warm layout primitives"
```

---

### Task 4: Shared chrome — logo, header, menu, contact band, footer, splash

**Files:**
- Modify: `apps/web/src/components/Logo.tsx`
- Modify: `apps/web/src/components/Offices.tsx`
- Modify: `apps/web/src/components/SocialMedia.tsx`
- Modify: `apps/web/src/components/Footer.tsx`
- Modify: `apps/web/src/components/ContactSection.tsx`
- Modify: `apps/web/src/components/RootLayout.tsx`
- Modify: `apps/web/src/components/EntrySplash.tsx`

- [ ] **Step 1: Rewrite `Logo`**

Replace the contents of `apps/web/src/components/Logo.tsx` with:

```tsx
import Image from 'next/image'
import clsx from 'clsx'

import { site } from '@/lib/site'

// The icon PNG has heavy white padding, so it is scaled up inside a clipped circle.
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'relative block size-13 flex-none overflow-hidden rounded-full bg-white shadow-[0_8px_20px_rgb(42_24_10/0.08)]',
        className,
      )}
    >
      <Image
        src={site.logos.icon}
        alt=""
        width={320}
        height={320}
        priority
        className="size-full scale-[2.7] object-cover"
      />
    </span>
  )
}

export function Logo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      <LogoMark className={markClassName} />
      <span className="type-display text-xl">{site.shortName}</span>
    </span>
  )
}
```

- [ ] **Step 2: Rewrite `Offices`**

Replace the contents of `apps/web/src/components/Offices.tsx` with:

```tsx
import clsx from 'clsx'

export function Offices({
  invert = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'ul'> & { invert?: boolean }) {
  return (
    <ul role="list" className={className} {...props}>
      <li>
        <address
          className={clsx(
            'text-base/[1.5] not-italic',
            invert ? 'text-warm-cream/80' : 'text-warm-muted',
          )}
        >
          <strong
            className={clsx(
              'type-display block text-3xl',
              invert ? 'text-warm-cream' : 'text-warm-ink',
            )}
          >
            Mount Washington
          </strong>
          <span className="mt-2 block">
            Serving Mount Washington properties and the surrounding Comox
            Valley.
          </span>
        </address>
      </li>
    </ul>
  )
}
```

- [ ] **Step 3: Restyle `SocialMedia` as round buttons**

In `apps/web/src/components/SocialMedia.tsx`, replace everything from `export function SocialMedia({` to the end of the file with:

```tsx
export function SocialMedia({
  className,
  invert = false,
}: {
  className?: string
  invert?: boolean
}) {
  return (
    <ul role="list" className={clsx('flex gap-3', className)}>
      {socialMediaProfiles.map((socialMediaProfile) => (
        <li key={socialMediaProfile.title}>
          <Link
            href={socialMediaProfile.href}
            aria-label={socialMediaProfile.title}
            className={clsx(
              'grid size-12 place-items-center rounded-full transition',
              invert
                ? 'bg-warm-cream/10 text-warm-cream hover:bg-warm-cream/20'
                : 'bg-warm-cream text-warm-ink hover:bg-white',
            )}
          >
            <socialMediaProfile.icon className="size-5.5 fill-current" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Rewrite `Footer`**

Replace the contents of `apps/web/src/components/Footer.tsx` with:

```tsx
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { socialMediaProfiles } from '@/components/SocialMedia'
import { site } from '@/lib/site'

const navigation = [
  {
    title: 'Services',
    links: [
      { title: 'Property Management', href: '/property-management' },
      { title: 'Renovations', href: '/renovations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About', href: '/about' },
      { title: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Connect',
    links: socialMediaProfiles,
  },
]

export function Footer() {
  return (
    <Band tone="cream" as="footer" last>
      <Container>
        <div className="grid gap-10 split:grid-cols-[1.3fr_repeat(3,1fr)]">
          <Link href="/" className="self-start rounded-full">
            <Logo />
          </Link>
          {navigation.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                {section.title}
              </h2>
              <ul role="list" className="mt-3.5 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-[1.0625rem] font-semibold transition hover:text-ember-deep"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2 rounded-[2rem] bg-sand px-6 py-4.5 text-sm text-warm-muted split:rounded-full">
          <p>
            © {site.shortName} {new Date().getFullYear()}
          </p>
          <p>Mount Washington · Comox Valley</p>
        </div>
      </Container>
    </Band>
  )
}
```

- [ ] **Step 5: Rewrite `ContactSection` as the sun band**

Replace the contents of `apps/web/src/components/ContactSection.tsx` with:

```tsx
import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { Offices } from '@/components/Offices'

export function ContactSection() {
  return (
    <Band tone="sun">
      <Container className="grid gap-10 split:grid-cols-[1.3fr_0.7fr] split:items-end">
        <FadeIn>
          <h2 className="type-display max-w-[12ch] text-[clamp(3.25rem,6vw,5.5rem)] text-balance">
            Ready to simplify property ownership?
          </h2>
          <p className="mt-5 max-w-[38ch] text-[1.1875rem]/[1.5] text-[#4a2f14]">
            Whether you&apos;re looking for property management, local property
            support, or renovation services, we&apos;d love to learn more about
            your property and how we can help.
          </p>
          <Button href="/contact" tone="forest" arrow className="mt-8">
            Contact us
          </Button>
        </FadeIn>
        <FadeIn className="rounded-[2.5rem] bg-warm-cream p-7.5">
          <Kicker as="h3">Service area</Kicker>
          <Offices className="mt-4" />
        </FadeIn>
      </Container>
    </Band>
  )
}
```

- [ ] **Step 6: Rewrite `RootLayout` with the floating pill header and forest menu**

Replace the contents of `apps/web/src/components/RootLayout.tsx` with:

```tsx
'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Kicker } from '@/components/Kicker'
import { Logo } from '@/components/Logo'
import { NumberBadge } from '@/components/NumberBadge'
import { Offices } from '@/components/Offices'
import { SocialMedia } from '@/components/SocialMedia'

const headerLinks = [
  { href: '/property-management', label: 'Property Management' },
  { href: '/renovations', label: 'Renovations' },
  { href: '/about', label: 'About Us' },
]

const menuLinks = [...headerLinks, { href: '/contact', label: 'Contact' }]

function SiteHeader({
  panelId,
  menuOpen,
  onOpenMenu,
  openRef,
}: {
  panelId: string
  menuOpen: boolean
  onOpenMenu: () => void
  openRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-4 pt-5">
      <div className="mx-auto flex max-w-[75rem] items-center justify-between gap-4 rounded-full bg-warm-cream/95 py-2.5 pr-2.5 pl-3 text-warm-ink shadow-[0_18px_40px_rgb(42_24_10/0.18)] backdrop-blur">
        <Link href="/" className="rounded-full">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-full px-4 py-3 text-[0.9375rem] font-semibold transition hover:bg-sand split:inline-flex"
            >
              {link.label}
            </Link>
          ))}
          <span className="hidden split:block">
            <Button href="/contact" size="sm">
              Get in touch
            </Button>
          </span>
          <button
            ref={openRef}
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            className="rounded-full px-5 py-3 text-[0.9375rem] font-bold ring-2 ring-warm-ink ring-inset split:hidden"
          >
            Menu
          </button>
        </nav>
      </div>
    </header>
  )
}

function MenuPanel({
  id,
  onClose,
  closeRef,
}: {
  id: string
  onClose: () => void
  closeRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-forest-warm text-warm-cream"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <Container className="flex flex-auto flex-col">
        <div className="flex items-center justify-between pt-7">
          <Link href="/" onClick={onClose} className="rounded-full">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-sun px-6 py-4 font-bold text-warm-ink focus-visible:-outline-offset-4"
          >
            Close
          </button>
        </div>

        <nav aria-label="Main" className="mt-10">
          <ol role="list" className="grid gap-3">
            {menuLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-full bg-warm-cream/8 py-2.5 pr-6 pl-2.5 transition hover:bg-warm-cream/15"
                >
                  <NumberBadge value={index + 1} tone="sun" />
                  <span className="type-display text-[clamp(2rem,5vw,3.5rem)]">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-auto grid gap-10 py-12 split:grid-cols-2">
          <div>
            <Kicker as="h2" tone="dark">
              Service area
            </Kicker>
            <Offices invert className="mt-4" />
          </div>
          <div>
            <Kicker as="h2" tone="dark">
              Follow us
            </Kicker>
            <SocialMedia invert className="mt-5" />
          </div>
        </div>
      </Container>
    </motion.div>
  )
}

function RootLayoutInner({ children }: { children: React.ReactNode }) {
  let panelId = useId()
  let [open, setOpen] = useState(false)
  let openRef = useRef<HTMLButtonElement>(null)
  let closeRef = useRef<HTMLButtonElement>(null)
  let wasOpen = useRef(false)

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) openRef.current?.focus({ preventScroll: true })
      wasOpen.current = false
      return
    }

    wasOpen.current = true
    closeRef.current?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <MotionConfig reducedMotion="user">
      <div
        inert={open ? true : undefined}
        className="relative flex min-h-full flex-auto flex-col"
      >
        <SiteHeader
          panelId={panelId}
          menuOpen={open}
          onOpenMenu={() => setOpen(true)}
          openRef={openRef}
        />
        <main className="w-full flex-auto">{children}</main>
        <Footer />
      </div>
      <AnimatePresence>
        {open && (
          <MenuPanel
            id={panelId}
            onClose={() => setOpen(false)}
            closeRef={closeRef}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

export function RootLayout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()

  return <RootLayoutInner key={pathname}>{children}</RootLayoutInner>
}
```

- [ ] **Step 7: Rewrite `EntrySplash`**

Replace the contents of `apps/web/src/components/EntrySplash.tsx` with:

```tsx
'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { LogoMark } from '@/components/Logo'
import { site } from '@/lib/site'

const SPLASH_KEY = 'strathcona-splash-seen'

function subscribe() {
  return () => {}
}

function getSeenOnClient() {
  return sessionStorage.getItem(SPLASH_KEY) !== null
}

// The server never shows the splash, so hydration always starts hidden.
function getSeenOnServer() {
  return true
}

export function EntrySplash() {
  const shouldReduceMotion = useReducedMotion()
  const alreadySeen = useSyncExternalStore(
    subscribe,
    getSeenOnClient,
    getSeenOnServer,
  )
  const [dismissed, setDismissed] = useState(false)
  const show = !alreadySeen && !dismissed

  useEffect(() => {
    if (alreadySeen) {
      return
    }

    document.body.style.overflow = 'hidden'

    const timer = window.setTimeout(
      () => {
        sessionStorage.setItem(SPLASH_KEY, '1')
        setDismissed(true)
        document.body.style.overflow = ''
      },
      shouldReduceMotion ? 600 : 2800,
    )

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [alreadySeen, shouldReduceMotion])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="entry-splash"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-warm-cream px-6 text-warm-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.9,
            ease: 'easeOut',
          }}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <LogoMark className="size-28" />
            <p className="type-display mt-6 text-5xl">{site.shortName}</p>
            <p className="mt-4 text-xs font-bold tracking-[0.16em] text-warm-muted uppercase">
              {site.tagline}
            </p>
            <span aria-hidden="true" className="mt-6 h-1.5 w-12 rounded-full bg-sun" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
```

- [ ] **Step 8: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 9: Check the chrome in a browser**

Open `http://localhost:3000/renovations` (its old content still renders; judge only the chrome):

- At 1280px wide: a cream pill header floats at the top with the logo mark in a white circle, "Strathcona Summit", three text links, and a sun "Get in touch" pill. No "Menu" button.
- At 375px wide: the three links and "Get in touch" are gone; a "Menu" pill shows. Click it: a forest full-screen panel opens with four large rounded rows numbered 01–04, and keyboard focus is on "Close". Press `Escape`: the panel closes and focus returns to "Menu". Open it again and press `Tab` repeatedly: focus never reaches the page behind the panel.
- Scroll to the bottom: a sun contact band with "Ready to simplify property ownership?" and a cream service-area card, then a cream footer with rounded top corners and a sand copyright strip.
- In a private window, open `http://localhost:3000/`: the splash shows the mark in a white circle, the name, and the tagline on cream, then fades. Reload: no splash.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/components/Logo.tsx apps/web/src/components/Offices.tsx apps/web/src/components/SocialMedia.tsx apps/web/src/components/Footer.tsx apps/web/src/components/ContactSection.tsx apps/web/src/components/RootLayout.tsx apps/web/src/components/EntrySplash.tsx
git commit -m "feat(web): redesign header, menu, contact band, footer, and splash"
```

---

### Task 5: Home page

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Rewrite the home page**

Replace the contents of `apps/web/src/app/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  description: site.description,
}

type Service = {
  title: string
  href: string
  description: string
  image: string | null
}

const services: Array<Service> = [
  {
    title: 'Property Management',
    href: '/property-management',
    description:
      'Full-service vacation rental management, including guest communication, revenue optimization, booking management, and property oversight.',
    image: site.images.hero,
  },
  {
    title: 'Property Support Services',
    href: '/contact',
    description:
      'Cleaning, laundry, inspections, maintenance, and guest-ready support for self-managed properties.',
    image: null,
  },
  {
    title: 'Renovations & Improvements',
    href: '/renovations',
    description:
      "Repairs, upgrades, and renovation projects that enhance your property's value, functionality, and guest experience.",
    image: site.images.renovations,
  },
]

const reasons = [
  {
    title: 'Local expertise',
    description:
      'Based on Mount Washington, we provide responsive support and year-round oversight.',
  },
  {
    title: 'Hospitality standards',
    description:
      'Our background in luxury hospitality influences every aspect of the guest and owner experience.',
  },
  {
    title: 'One trusted team',
    description:
      'Property management, support services, and renovations—all coordinated through one trusted team.',
  },
]

function ServiceTile({ service, index }: { service: Service; index: number }) {
  let photo = service.image !== null

  return (
    <FadeIn
      className={clsx(
        'relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2.75rem] p-7 split:min-h-[29rem]',
        photo ? 'bg-forest-warm text-warm-cream' : 'bg-sun text-warm-ink',
      )}
    >
      {service.image !== null && (
        <>
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(min-width: 900px) 33vw, 100vw"
            className="photo-warm -z-20 object-cover"
          />
          <div aria-hidden="true" className="tile-shade absolute inset-0 -z-10" />
        </>
      )}
      <NumberBadge
        value={index + 1}
        tone={photo ? 'cream' : 'ink'}
        className="absolute top-6 left-6"
      />
      <h3 className="type-display text-[clamp(2.125rem,3.2vw,2.875rem)]">
        {service.title}
      </h3>
      <p className="mt-3 mb-5 text-base/[1.45] opacity-90">
        {service.description}
      </p>
      <Button
        href={service.href}
        tone={photo ? 'sun' : 'cream'}
        size="sm"
        aria-label={`Learn more about ${service.title}`}
        className="self-start"
      >
        Learn more
      </Button>
    </FadeIn>
  )
}

function Services() {
  return (
    <Band tone="sand">
      <Container>
        <SectionHead
          kicker="How we support property owners"
          title="One local team. Complete property care."
        >
          <p>
            Owning a mountain property comes with unique responsibilities. We
            help owners simplify the process through professional management,
            dependable local support, and thoughtful property improvements.
          </p>
        </SectionHead>
        <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-[1.25fr_1fr_1fr]">
          {services.map((service, index) => (
            <ServiceTile key={service.title} service={service} index={index} />
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}

function WhyUs() {
  return (
    <Band tone="forest" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="sun-glow pointer-events-none absolute -top-40 -right-36 size-[32.5rem] rounded-full"
      />
      <Container className="relative">
        <SectionHead
          tone="dark"
          kicker="Why owners choose us"
          title="Local expertise. Hospitality standards. One trusted team."
        >
          <p>
            We bring together professional property management, luxury
            hospitality experience, and hands-on local support to help owners
            maximize value and deliver exceptional guest experiences.
          </p>
        </SectionHead>
        <ValueCards items={reasons} />
      </Container>
    </Band>
  )
}

export default function Home() {
  return (
    <>
      <EntrySplash />
      <RootLayout>
        <PageHero
          size="full"
          kicker="Mount Washington"
          title="Property management from a team that lives here."
          image={{
            src: site.images.hero,
            alt: 'Mount Washington alpine landscape',
          }}
          actions={
            <>
              <Button href="/contact" arrow>
                Get in touch
              </Button>
              <Button href="/property-management" tone="glass">
                View services
              </Button>
            </>
          }
        >
          <p>
            We built {site.name} to give homeowners and vacation rental hosts a
            dependable local partner for property management. Backed by
            in-house cleaning, maintenance, and renovation services, we help
            owners maximize revenue, protect their investment, and deliver
            exceptional guest experiences.
          </p>
        </PageHero>
        <Services />
        <WhyUs />
        <ContactSection />
      </RootLayout>
    </>
  )
}
```

- [ ] **Step 2: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines. If `/` fails, the output shows the first differing word — fix the text in `page.tsx` to match the baseline, never the baseline.

- [ ] **Step 3: Compare with the approved mockup**

Open `http://localhost:3000/` at 1280px and at 375px, next to `docs/superpowers/specs/assets/2026-09-28-web-redesign-homepage-mockup.html` opened from disk:

- The hero photo fills the viewport edge to edge, warm-graded; the headline is readable over the sky.
- The sand band's rounded top overlaps the bottom of the hero; no hero text is covered.
- Three service tiles: two photo tiles and one solid sun tile, each with a numbered circle and a "Learn more" pill.
- The forest band has a soft sun glow in its top-right corner and three translucent cards with sun orbs.
- At 375px everything stacks into one column and nothing overflows horizontally.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(web): redesign home page"
```

---

### Task 6: Property Management page

**Files:**
- Create: `apps/web/src/components/PhotoBand.tsx`
- Modify: `apps/web/src/app/property-management/page.tsx`

- [ ] **Step 1: Create `PhotoBand`**

Create `apps/web/src/components/PhotoBand.tsx`:

```tsx
import Image from 'next/image'

export function PhotoBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="relative z-10 mt-[calc(var(--band-radius)*-1)] h-[min(70vh,40rem)] overflow-hidden rounded-t-[var(--band-radius)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="photo-warm object-cover"
      />
    </section>
  )
}
```

- [ ] **Step 2: Rewrite the page**

Replace the contents of `apps/web/src/app/property-management/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PhotoBand } from '@/components/PhotoBand'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Property Management & Cleaning',
  description:
    'Vacation rental cleaning, caretaking, and full property management on Vancouver Island.',
}

const tiers = [
  {
    label: 'Tier 1',
    title: 'Basic cleaning',
    description:
      'You send dates, we clean and reset the property. Ideal when you handle bookings and guest communication yourself.',
    tone: 'bg-sand text-warm-ink',
  },
  {
    label: 'Tier 2',
    title: 'Cleaning + caretaking',
    description:
      'Maintenance checks, restocking, and proactive care between guests. You stay in control of marketing and bookings.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    label: 'Tier 3',
    title: 'Full property management',
    description:
      'End-to-end operations: bookings coordination, owner statements, and the full payout workflow. Built for hands-off owners.',
    tone: 'bg-forest-warm text-warm-cream',
  },
]

const inclusions = [
  'Turnover cleaning & linen service',
  'Restocking & supplies',
  'Hot tub & exterior checks',
  'Photo documentation',
  'Maintenance flagging',
  'Direct booking intake (Tier 2+)',
]

const platformFeatures = [
  {
    title: 'Calendar sync',
    description:
      'iCal integration keeps cleaning jobs aligned with confirmed stays.',
  },
  {
    title: 'Guest-ready standard',
    description:
      'Consistent checklists and photo records for every turnover.',
  },
  {
    title: 'Owner visibility',
    description:
      'Tier 3 owners get statements, breakdowns, and a dedicated portal as the platform rolls out.',
  },
]

export default function PropertyManagement() {
  return (
    <RootLayout>
      <PageHero
        kicker="Property management"
        title="Cleaning, caretaking, and full management for your property."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
      >
        <p>
          From scheduled turnover cleans to complete owner support, we offer
          three service tiers so you only pay for the level of involvement you
          need.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container>
          <FadeInStagger className="grid gap-4.5 split:grid-cols-[1fr_1fr_1.35fr]">
            {tiers.map((tier) => (
              <FadeIn
                key={tier.label}
                className={clsx(
                  'flex min-h-[22rem] flex-col rounded-[2.75rem] p-8',
                  tier.tone,
                )}
              >
                <p className="text-sm font-bold tracking-[0.08em] uppercase">
                  {tier.label}
                </p>
                <h2 className="type-display mt-auto pt-16 text-[clamp(2.25rem,3.4vw,3rem)]">
                  {tier.title}
                </h2>
                <p className="mt-3 text-base/[1.5] opacity-90">
                  {tier.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="sand">
        <Container>
          <SectionHead kicker="Included" title="What every visit covers">
            <p>
              Our cleaning checklists are built from real turnover workflows —
              not generic templates — so nothing gets missed before the next
              guest arrives.
            </p>
          </SectionHead>
          <FadeIn>
            <ul role="list" className="mt-12 flex flex-wrap gap-3">
              {inclusions.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-warm-cream px-6 py-4 text-lg font-semibold"
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </Container>
      </Band>

      <Band tone="forest">
        <Container>
          <SectionHead
            tone="dark"
            kicker="Platforms"
            title="Works with how you already book."
          >
            <p>
              We sync with Airbnb and VRBO calendars and can coordinate direct
              bookings through {site.shortName} as your portfolio grows.
            </p>
          </SectionHead>
          <ValueCards items={platformFeatures} />
        </Container>
      </Band>

      <PhotoBand
        src={site.images.hero}
        alt="Snow-capped mountain peak above Vancouver Island forest"
      />

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 3: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 4: Check in a browser**

Open `http://localhost:3000/property-management` at 1280px and 375px: warm photo hero; three tier tiles (sand, sun, forest) with Tier 3 widest at 1280px; six cream pills on sand; forest band with three cards; a full-bleed photo band; the contact band overlapping the photo's bottom edge.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/PhotoBand.tsx apps/web/src/app/property-management/page.tsx
git commit -m "feat(web): redesign property management page"
```

---

### Task 7: Renovations page

**Files:**
- Modify: `apps/web/src/app/renovations/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the contents of `apps/web/src/app/renovations/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Renovations & Construction',
  description:
    'Renovation and construction services on Vancouver Island — estimates, contracts, and seasonal project delivery.',
}

const steps = [
  {
    title: 'Estimate',
    description:
      'Line-item breakdowns for materials, labour, and margin — no mystery allowances.',
  },
  {
    title: 'Contract',
    description:
      'Fixed-price, cost-plus, or time & materials — we match the agreement to how well-defined the scope is.',
  },
  {
    title: 'Build',
    description:
      'In-progress updates, change orders when scope shifts, and milestone billing tied to real progress.',
  },
  {
    title: 'Complete',
    description:
      'Final walkthrough, punch list, and documentation for your records.',
  },
]

const projectTypes = [
  {
    title: 'Kitchens & bathrooms',
    description:
      'Layout updates, cabinetry, tile, fixtures, and ventilation — the rooms guests and owners notice first.',
    tone: 'bg-warm-cream text-warm-ink',
  },
  {
    title: 'Decks & exteriors',
    description:
      'Weather-ready materials suited for coastal conditions and strata requirements where applicable.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    title: 'Whole-home refresh',
    description:
      'Flooring, paint, trim, and lighting packages to reset a property between seasons or before sale.',
    tone: 'bg-forest-warm text-warm-cream',
  },
  {
    title: 'Subtrade coordination',
    description:
      'Licensed trades brought in as needed — one point of contact for the owner.',
    tone: 'bg-warm-cream text-warm-ink',
  },
]

export default function Renovations() {
  return (
    <RootLayout>
      <PageHero
        kicker="Renovations"
        title="Seasonal construction with clear estimates and honest timelines."
        image={{
          src: site.images.renovations,
          alt: 'Interior renovation framing and construction in progress',
          position: 'center 55%',
        }}
      >
        <p>
          Summer-heavy renovation work across Vancouver Island — from kitchen
          refreshes to full interior updates. We walk you through scope, budget,
          and contract type before a single hammer swings.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container>
          <FadeInStagger className="relative">
            <div
              aria-hidden="true"
              className="absolute top-8 right-[calc((100%-4.5rem)/8)] left-[calc((100%-4.5rem)/8)] hidden h-1 rounded-full bg-sun/40 split:block"
            />
            <ol role="list" className="relative grid gap-10 split:grid-cols-4 split:gap-6">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <FadeIn className="flex gap-5 split:flex-col split:items-center split:text-center">
                    <NumberBadge
                      value={index + 1}
                      tone="sun"
                      size="lg"
                      className="relative"
                    />
                    <div>
                      <h2 className="type-display text-4xl">{step.title}</h2>
                      <p className="mt-3 text-base/[1.55] text-warm-muted">
                        {step.description}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ol>
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="sand">
        <Container>
          <SectionHead kicker="Project types" title="What we typically take on">
            <p>
              Renovation demand peaks in summer — we plan capacity so your
              project gets focused attention during the window that works for
              Island properties.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-2">
            {projectTypes.map((project) => (
              <FadeIn
                key={project.title}
                className={clsx(
                  'flex min-h-[16rem] flex-col justify-end rounded-[2.75rem] p-8',
                  project.tone,
                )}
              >
                <h3 className="type-display text-[clamp(2.125rem,3.2vw,2.75rem)]">
                  {project.title}
                </h3>
                <p className="mt-3 text-base/[1.5] opacity-90">
                  {project.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="apricot">
        <Container className="grid items-center gap-10 split:grid-cols-[0.8fr_1.2fr] split:gap-16">
          <FadeIn className="relative aspect-4/5 overflow-hidden rounded-[2.75rem]">
            <Image
              src={site.images.renovations}
              alt="Renovation construction framing and electrical rough-in"
              fill
              sizes="(min-width: 900px) 40vw, 100vw"
              className="photo-warm object-cover"
            />
          </FadeIn>
          <FadeIn>
            <figure>
              <blockquote className="type-display text-[clamp(2.25rem,4vw,3.5rem)] text-balance">
                <p>
                  <span aria-hidden="true">“</span>We would rather set
                  expectations early than surprise you mid-project — clear scope
                  up front keeps everyone aligned.
                  <span aria-hidden="true">”</span>
                </p>
              </blockquote>
              <figcaption className="mt-8 text-lg font-bold">
                Joel, Co-founder
              </figcaption>
            </figure>
          </FadeIn>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 2: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 3: Check in a browser**

Open `http://localhost:3000/renovations` at 1280px: four sun circles in a row joined by a faint sun line that starts at the first circle's centre and ends at the last; four project tiles in a 2×2 grid; an apricot band with the rounded photo beside Joel's quote. At 375px the steps stack with the circle to the left of each step and no connecting line.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/renovations/page.tsx
git commit -m "feat(web): redesign renovations page"
```

---

### Task 8: About page

**Files:**
- Modify: `apps/web/src/app/about/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the contents of `apps/web/src/app/about/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image from 'next/image'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import imageMeeting from '@/images/meeting.jpg'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet Joel and Amanda — the team behind Strathcona Summit Solutions on Vancouver Island.',
}

const stats = [
  { value: '2', label: 'Founding partners' },
  { value: '3', label: 'Service tiers (PM)' },
  { value: '1', label: 'Island we call home' },
]

const values = [
  {
    title: 'Reliability',
    description:
      'Turnovers happen on schedule. Renovation milestones are tracked. You hear from us when something needs a decision.',
  },
  {
    title: 'Transparency',
    description:
      'Clear tiers, documented visits, and estimates that explain where your money goes.',
  },
  {
    title: 'Local accountability',
    description:
      'We are not a franchise or a distant management company — Joel and Amanda stay close to the work.',
  },
]

const founders = [
  {
    name: 'Joel',
    role: 'Co-founder — growth & client relationships',
  },
  {
    name: 'Amanda',
    role: 'Co-founder — operations & day-to-day delivery',
  },
]

export default function About() {
  return (
    <RootLayout>
      <PageHero kicker="About us" title="Built on trust, rooted on the Island.">
        <p>
          {site.shortName} started with a simple idea: property owners on
          Vancouver Island deserve a local team that communicates clearly, shows
          up reliably, and treats every home with respect.
        </p>
        <p>
          Joel and Amanda launched the company to combine property management
          and seasonal renovation work under one accountable partner — so owners
          are not juggling separate vendors for cleaning, maintenance, and
          construction.
        </p>
        <p>
          The name honours Strathcona Park — rugged coast, alpine peaks, and the
          landscape that defines life on the Island. That is the standard we
          bring to your property: sturdy, honest, and built to last.
        </p>
      </PageHero>

      <Band tone="sand">
        <Container>
          <FadeInStagger>
            <dl className="grid gap-12 split:grid-cols-3">
              {stats.map((stat) => (
                <FadeIn
                  key={stat.label}
                  className="flex flex-col-reverse items-center text-center"
                >
                  <dt className="mt-5 text-lg font-semibold text-warm-muted">
                    {stat.label}
                  </dt>
                  <dd className="type-display grid size-40 place-items-center rounded-full bg-sun text-[5.5rem] text-warm-ink shadow-[0_24px_50px_rgb(217_119_47/0.3)] split:size-48 split:text-[6.5rem]">
                    {stat.value}
                  </dd>
                </FadeIn>
              ))}
            </dl>
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="forest">
        <Container>
          <SectionHead
            tone="dark"
            kicker="Our values"
            title="Professional, approachable, and Pacific Northwest at heart."
          >
            <p>
              We are in people&apos;s homes. That requires more than a checklist
              — it requires judgment, discretion, and genuine care.
            </p>
          </SectionHead>
          <ValueCards items={values} />
        </Container>
      </Band>

      <Band tone="cream">
        <Container>
          <FadeInStagger>
            <FadeIn>
              <h2 className="type-display text-[clamp(3.25rem,6vw,5.5rem)]">
                Leadership
              </h2>
            </FadeIn>
            <ul role="list" className="mt-10 grid gap-4.5 split:grid-cols-2">
              {founders.map((person) => (
                <li key={person.name}>
                  <FadeIn className="overflow-hidden rounded-[2.75rem] bg-sand">
                    <Image
                      src={imageMeeting}
                      alt=""
                      sizes="(min-width: 900px) 36rem, 100vw"
                      className="photo-warm aspect-4/3 w-full object-cover"
                    />
                    <div className="p-8">
                      <p className="type-display text-4xl">{person.name}</p>
                      <p className="mt-2 text-base text-warm-muted">
                        {person.role}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-warm-muted">
              Replace placeholder photos with Joel and Amanda headshots when
              available.
            </p>
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 2: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines. (The stats keep `dt` before `dd` in the markup, as the original did, so the copy order matches.)

- [ ] **Step 3: Check in a browser**

Open `http://localhost:3000/about`: the warm gradient hero (no photo) with all three paragraphs readable; three big sun discs with 2, 3, 1 and labels beneath; forest values band; two rounded founder tiles on cream with the placeholder note.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/about/page.tsx
git commit -m "feat(web): redesign about page"
```

---

### Task 9: Contact page and form

**Files:**
- Modify: `apps/web/src/components/ContactForm.tsx`
- Modify: `apps/web/src/app/contact/page.tsx`

- [ ] **Step 1: Restyle the form (behaviour unchanged)**

Replace the contents of `apps/web/src/components/ContactForm.tsx` with:

```tsx
'use client'

import { useActionState, useId } from 'react'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import {
  submitContactForm,
  type ContactFormState,
} from '@/lib/actions'

const initialState: ContactFormState = {
  success: false,
  message: '',
}

function TextInput({
  label,
  required,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & {
  label: string
  required?: boolean
}) {
  let id = useId()

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        required={required}
        {...props}
        placeholder=" "
        className="peer block w-full rounded-full border-2 border-sand bg-warm-cream px-6 pt-7 pb-2.5 text-base/6 text-warm-ink transition focus:border-warm-ink focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-warm-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-warm-ink peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-warm-ink"
      >
        {label}
        {required ? (
          <span className="text-ember-deep" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
    </div>
  )
}

function RadioInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="size-6 flex-none appearance-none rounded-full border-2 border-warm-ink/25 bg-white checked:border-[0.45rem] checked:border-sun"
      />
      <span className="text-base/6 text-warm-ink">{label}</span>
    </label>
  )
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  )

  return (
    <FadeIn className="rounded-[2.5rem] bg-white p-7 shadow-[0_24px_60px_rgb(42_24_10/0.08)] split:p-10">
      <form action={formAction}>
        <h2 className="type-display text-4xl">Send us a message</h2>
        <p className="mt-3 text-base text-warm-muted">
          We typically respond within one business day.
        </p>

        {state.message ? (
          <p
            role="status"
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              state.success
                ? 'bg-sand text-warm-ink'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <div
          className={`mt-7 grid gap-3 ${
            pending || state.success ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <TextInput label="Name" name="name" autoComplete="name" required />
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
          <TextInput label="Phone" type="tel" name="phone" autoComplete="tel" />
          <TextInput label="Property location" name="location" />
          <TextInput label="Message" name="message" required />
          <div className="rounded-[2rem] border-2 border-sand bg-warm-cream px-6 py-6">
            <fieldset>
              <legend className="text-base/6 font-semibold text-warm-ink">
                What can we help with?
              </legend>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <RadioInput
                  label="Property management / cleaning"
                  name="service"
                  value="pm"
                  defaultChecked
                />
                <RadioInput
                  label="Renovation / construction"
                  name="service"
                  value="reno"
                />
                <RadioInput label="Both" name="service" value="both" />
                <RadioInput label="Not sure yet" name="service" value="other" />
              </div>
            </fieldset>
          </div>
        </div>

        <Button
          type="submit"
          arrow
          className="mt-8"
          disabled={pending || state.success}
        >
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </FadeIn>
  )
}
```

- [ ] **Step 2: Rewrite the contact page**

Replace the contents of `apps/web/src/app/contact/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { Offices } from '@/components/Offices'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SocialMedia } from '@/components/SocialMedia'
import { site } from '@/lib/site'

function ContactDetails() {
  return (
    <FadeIn className="rounded-[2.5rem] bg-sand p-8 split:p-10">
      <Kicker as="h2">Service area</Kicker>
      <p className="mt-4 text-base/[1.6] text-warm-muted">
        We serve property owners across Vancouver Island. Reach out to confirm
        coverage for your address.
      </p>
      <Offices className="mt-6" />

      <div className="mt-8 border-t-2 border-warm-cream pt-8">
        <Kicker as="h2">Email & phone</Kicker>
        <dl className="mt-4 grid gap-5 text-base">
          <div>
            <dt className="font-bold text-warm-ink">General inquiries</dt>
            <dd className="mt-1">
              <Link
                href={`mailto:${site.contactEmail}`}
                className="text-warm-muted underline decoration-sun decoration-2 underline-offset-4 hover:text-warm-ink"
              >
                {site.contactEmail}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="font-bold text-warm-ink">Phone</dt>
            <dd className="mt-1 text-warm-muted">{site.phone}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border-t-2 border-warm-cream pt-8">
        <Kicker as="h2">Follow us</Kicker>
        <SocialMedia className="mt-5" />
      </div>
    </FadeIn>
  )
}

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${site.shortName} about property management, cleaning, or renovations.`,
}

export default function Contact() {
  return (
    <RootLayout>
      <PageHero
        size="short"
        kicker="Contact"
        title="Let's talk about your property."
      >
        <p>
          Tell us a bit about your property and what you need — we will get back
          to you shortly.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container className="grid items-start gap-4.5 split:grid-cols-[1.2fr_0.8fr]">
          <ContactForm />
          <ContactDetails />
        </Container>
      </Band>
    </RootLayout>
  )
}
```

- [ ] **Step 3: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 4: Check the form in a browser**

Open `http://localhost:3000/contact`:

- The form sits on a white rounded sheet with pill-shaped fields; the sand details card sits to its right at 1280px and below it at 375px.
- Tab through every field: each shows a visible focus indication (dark border on inputs, outline on radios and the button). Floating labels move up on focus and stay up once filled.
- Submit with the Name field empty: the browser's required-field message appears and nothing is sent.
- There is no sun contact band on this page; the cream footer follows the form band directly.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/ContactForm.tsx apps/web/src/app/contact/page.tsx
git commit -m "feat(web): redesign contact page and form"
```

---

### Task 10: Shared content components (MDX, quotes, lists, links)

**Files:**
- Modify: `apps/web/src/components/Border.tsx`
- Modify: `apps/web/src/components/Blockquote.tsx`
- Modify: `apps/web/src/components/StatList.tsx`
- Modify: `apps/web/src/components/TagList.tsx`
- Modify: `apps/web/src/components/List.tsx`
- Modify: `apps/web/src/components/PageLinks.tsx`
- Modify: `apps/web/src/components/Testimonial.tsx`
- Modify: `apps/web/src/components/MDXComponents.tsx`
- Modify: `apps/web/src/styles/typography.css`

- [ ] **Step 1: Warm the `Border` accents**

In `apps/web/src/components/Border.tsx`, replace:

```tsx
        invert
          ? 'before:bg-gold-light after:bg-white/10'
          : 'before:bg-gold after:bg-neutral-950/10',
```

with:

```tsx
        invert
          ? 'before:bg-sun after:bg-warm-cream/15'
          : 'before:bg-sun after:bg-warm-ink/10',
```

- [ ] **Step 2: Rewrite `Blockquote`**

Replace the contents of `apps/web/src/components/Blockquote.tsx` with:

```tsx
import Image, { type ImageProps } from 'next/image'
import clsx from 'clsx'

import { Border } from '@/components/Border'

type ImagePropsWithOptionalAlt = Omit<ImageProps, 'alt'> & { alt?: string }

function BlockquoteWithImage({
  author,
  children,
  className,
  image,
}: {
  author: { name: string; role: string }
  children: React.ReactNode
  className?: string
  image: ImagePropsWithOptionalAlt
}) {
  return (
    <figure
      className={clsx(
        'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-8 sm:grid-cols-12 sm:grid-rows-[1fr_auto_auto_1fr] sm:gap-x-10 lg:gap-x-16',
        className,
      )}
    >
      <blockquote className="type-display col-span-2 text-3xl text-warm-ink sm:col-span-7 sm:col-start-6 sm:row-start-2">
        {typeof children === 'string' ? <p>{children}</p> : children}
      </blockquote>
      <div className="col-start-1 row-start-2 overflow-hidden rounded-full bg-sand sm:col-span-5 sm:row-span-full sm:rounded-[2.5rem]">
        <Image
          alt=""
          {...image}
          sizes="(min-width: 1024px) 17.625rem, (min-width: 768px) 16rem, (min-width: 640px) 40vw, 3rem"
          className="photo-warm h-12 w-12 object-cover sm:aspect-7/9 sm:h-auto sm:w-full"
        />
      </div>
      <figcaption className="text-sm text-warm-ink sm:col-span-7 sm:row-start-3 sm:text-base">
        <span className="font-bold">{author.name}</span>
        <span className="hidden font-bold sm:inline">, </span>
        <br className="sm:hidden" />
        <span className="sm:font-bold">{author.role}</span>
      </figcaption>
    </figure>
  )
}

function BlockquoteWithoutImage({
  author,
  children,
  className,
}: {
  author: { name: string; role: string }
  children: React.ReactNode
  className?: string
}) {
  return (
    <Border position="left" className={clsx('pl-8', className)}>
      <figure className="text-base">
        <blockquote className="text-warm-muted *:relative *:first:before:absolute *:first:before:right-full *:first:before:content-['“'] *:last:after:content-['”']">
          {typeof children === 'string' ? <p>{children}</p> : children}
        </blockquote>
        <figcaption className="mt-5 font-bold text-ember-deep">
          {author.name}, {author.role}
        </figcaption>
      </figure>
    </Border>
  )
}

export function Blockquote(
  props:
    | React.ComponentPropsWithoutRef<typeof BlockquoteWithImage>
    | (React.ComponentPropsWithoutRef<typeof BlockquoteWithoutImage> & {
        image?: undefined
      }),
) {
  if (props.image) {
    return <BlockquoteWithImage {...props} />
  }

  return <BlockquoteWithoutImage {...props} />
}
```

- [ ] **Step 3: Warm `StatList`**

In `apps/web/src/components/StatList.tsx`, replace:

```tsx
      <dt className="mt-2 text-base text-neutral-600">{label}</dt>
      <dd className="font-display text-3xl font-semibold text-gold sm:text-4xl">
```

with:

```tsx
      <dt className="mt-2 text-base text-warm-muted">{label}</dt>
      <dd className="type-display text-4xl text-ember-deep sm:text-5xl">
```

- [ ] **Step 4: Warm `TagList` pills**

In `apps/web/src/components/TagList.tsx`, replace:

```tsx
        'rounded-full bg-gold/15 px-4 py-1.5 text-base text-neutral-800 ring-1 ring-gold/25',
```

with:

```tsx
        'rounded-full bg-sand px-4.5 py-2 text-base font-semibold text-warm-ink',
```

- [ ] **Step 5: Warm `List`**

In `apps/web/src/components/List.tsx`, replace:

```tsx
      <ul role="list" className={clsx('text-base text-neutral-600', className)}>
```

with:

```tsx
      <ul role="list" className={clsx('text-base text-warm-muted', className)}>
```

and replace:

```tsx
            <strong className="font-semibold text-gold">{`${title}. `}</strong>
```

with:

```tsx
            <strong className="font-bold text-ember-deep">{`${title}. `}</strong>
```

- [ ] **Step 6: Rewrite `PageLinks` as a sand band of cards**

Replace the contents of `apps/web/src/components/PageLinks.tsx` with:

```tsx
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { formatDate } from '@/lib/formatDate'

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 6" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3 18 .5v2H0v1h18v2L24 3Z"
      />
    </svg>
  )
}

interface Page {
  href: string
  date: string
  title: string
  description: string
}

function PageLink({ page }: { page: Page }) {
  return (
    <article className="relative flex h-full flex-col items-start rounded-[2.5rem] bg-warm-cream p-8">
      <h3 className="type-display mt-4 text-3xl">{page.title}</h3>
      <time
        dateTime={page.date}
        className="order-first text-sm font-semibold text-warm-muted"
      >
        {formatDate(page.date)}
      </time>
      <p className="mt-3 text-base/[1.55] text-warm-muted">{page.description}</p>
      <Link
        href={page.href}
        className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-sun px-4.5 py-3 text-[0.9375rem] font-bold text-warm-ink transition hover:bg-sun-light focus-visible:-outline-offset-4"
        aria-label={`Read more: ${page.title}`}
      >
        Read more
        <ArrowIcon className="w-6 flex-none fill-current" />
        <span className="absolute inset-0 rounded-[2.5rem]" />
      </Link>
    </article>
  )
}

export function PageLinks({
  title,
  pages,
  intro,
}: {
  title: string
  pages: Array<Page>
  intro?: string
}) {
  return (
    <Band tone="sand">
      <Container>
        <SectionHead title={title}>{intro && <p>{intro}</p>}</SectionHead>
        <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-2">
          {pages.map((page) => (
            <FadeIn key={page.href}>
              <PageLink page={page} />
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}
```

- [ ] **Step 7: Rewrite `Testimonial` as an apricot band**

Replace the contents of `apps/web/src/components/Testimonial.tsx` with:

```tsx
import Image, { type ImageProps } from 'next/image'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export function Testimonial({
  children,
  client,
}: {
  children: React.ReactNode
  client: { logo?: ImageProps['src'] | null; name: string }
}) {
  return (
    <Band tone="apricot">
      <Container>
        <FadeIn>
          <figure className="mx-auto max-w-4xl">
            <blockquote className="type-display text-[clamp(2.25rem,4.5vw,3.75rem)] text-balance">
              <p>
                <span aria-hidden="true">“</span>
                {children}
                <span aria-hidden="true">”</span>
              </p>
            </blockquote>
            <figcaption className="mt-10">
              {client.logo ? (
                <Image src={client.logo} alt={client.name} unoptimized />
              ) : (
                <p className="text-lg font-bold">— {client.name}</p>
              )}
            </figcaption>
          </figure>
        </FadeIn>
      </Container>
    </Band>
  )
}
```

- [ ] **Step 8: Swap the MDX image to a plain warm-graded image**

In `apps/web/src/components/MDXComponents.tsx`, replace the import block:

```tsx
import clsx from 'clsx'

import { Blockquote } from '@/components/Blockquote'
import { Border } from '@/components/Border'
import { GrayscaleTransitionImage } from '@/components/GrayscaleTransitionImage'
import { StatList, StatListItem } from '@/components/StatList'
import { TagList, TagListItem } from '@/components/TagList'
```

with:

```tsx
import Image, { type ImageProps } from 'next/image'
import clsx from 'clsx'

import { Blockquote } from '@/components/Blockquote'
import { Border } from '@/components/Border'
import { StatList, StatListItem } from '@/components/StatList'
import { TagList, TagListItem } from '@/components/TagList'
```

Replace the `img` entry:

```tsx
  img: function Img({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof GrayscaleTransitionImage>) {
    return (
      <div
        className={clsx(
          'group isolate my-10 overflow-hidden rounded-4xl bg-neutral-100 max-sm:-mx-6',
          className,
        )}
      >
        <GrayscaleTransitionImage
          {...props}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="aspect-16/10 w-full object-cover"
        />
      </div>
    )
  },
```

with:

```tsx
  img: function Img({
    className,
    alt = '',
    ...props
  }: Omit<ImageProps, 'alt'> & { alt?: string }) {
    return (
      <div
        className={clsx(
          'my-10 overflow-hidden rounded-[2.75rem] bg-sand max-sm:-mx-6',
          className,
        )}
      >
        <Image
          alt={alt}
          {...props}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="photo-warm aspect-16/10 w-full object-cover"
        />
      </div>
    )
  },
```

and in `TopTip`, replace:

```tsx
        <p className="font-display text-sm font-bold tracking-widest text-neutral-950 uppercase">
```

with:

```tsx
        <p className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
```

- [ ] **Step 9: Warm the article typography colours**

In `apps/web/src/styles/typography.css`, make these four replacements:

1. `  color: var(--color-neutral-950);` (first line inside `.typography {`) → `  color: var(--color-warm-ink);`
2. `    color: var(--color-neutral-500);` (inside `:where(li)::marker`) → `    color: var(--color-ember);`
3. `    border-bottom: 1px solid var(--color-neutral-950);` (inside `:where(thead th)`) → `    border-bottom: 1px solid var(--color-warm-ink);`
4. Both occurrences of `--theme(--color-neutral-950 / 0.1)` (inside `:where(td)` and `:where(hr)`) → `--theme(--color-warm-ink / 0.1)`

- [ ] **Step 10: Update callers of the changed props**

`PageLinks` no longer takes `className` and `Testimonial` no longer takes `className`. Typecheck will list the callers:

```bash
pnpm --filter ./apps/web typecheck
```

Expected: errors only in `src/app/blog/wrapper.tsx`, `src/app/work/wrapper.tsx`, and `src/app/work/page.tsx`, each about a `className` prop. Those three files are rewritten in Tasks 11 and 12; to keep this commit green, delete the `className="mt-24 sm:mt-32 lg:mt-40"` line from each `<PageLinks ... />` call in both wrappers and from the `<Testimonial ...>` call in `work/page.tsx`, then re-run typecheck.

- [ ] **Step 11: Verify**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 12: Commit**

```bash
git add apps/web/src/components/Border.tsx apps/web/src/components/Blockquote.tsx apps/web/src/components/StatList.tsx apps/web/src/components/TagList.tsx apps/web/src/components/List.tsx apps/web/src/components/PageLinks.tsx apps/web/src/components/Testimonial.tsx apps/web/src/components/MDXComponents.tsx apps/web/src/styles/typography.css apps/web/src/app/blog/wrapper.tsx apps/web/src/app/work/wrapper.tsx apps/web/src/app/work/page.tsx
git commit -m "feat(web): warm the shared content components"
```

---

### Task 11: Blog index and article pages

**Files:**
- Modify: `apps/web/src/app/blog/page.tsx`
- Modify: `apps/web/src/app/blog/wrapper.tsx`

- [ ] **Step 1: Rewrite the blog index**

Replace the contents of `apps/web/src/app/blog/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { formatDate } from '@/lib/formatDate'
import { loadArticles } from '@/lib/mdx'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stay up-to-date with the latest industry news as our marketing teams finds new ways to re-purpose old CSS tricks articles.',
}

export default async function Blog() {
  let articles = await loadArticles()

  return (
    <RootLayout>
      <PageHero kicker="Blog" title="The latest articles and news">
        <p>
          Stay up-to-date with the latest industry news as our marketing teams
          finds new ways to re-purpose old CSS tricks articles.
        </p>
      </PageHero>

      <Band tone="sand">
        <Container>
          <FadeInStagger className="grid gap-4.5">
            {articles.map((article) => (
              <FadeIn key={article.href}>
                <article className="rounded-[2.5rem] bg-warm-cream p-8 split:p-10">
                  <h2 className="type-display text-[clamp(2rem,3.5vw,3rem)]">
                    <Link href={article.href}>{article.title}</Link>
                  </h2>
                  <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-warm-muted">
                    <dt className="sr-only">Published</dt>
                    <dd>
                      <time dateTime={article.date}>
                        {formatDate(article.date)}
                      </time>
                    </dd>
                    <dt className="sr-only">Author</dt>
                    <dd className="flex items-center gap-3">
                      <Image
                        alt=""
                        {...article.author.image}
                        className="photo-warm size-11 rounded-full object-cover"
                      />
                      <span>
                        <span className="font-semibold text-warm-ink">
                          {article.author.name}
                        </span>
                        , {article.author.role}
                      </span>
                    </dd>
                  </dl>
                  <p className="mt-5 max-w-2xl text-base/[1.6] text-warm-muted">
                    {article.description}
                  </p>
                  <Button
                    href={article.href}
                    size="sm"
                    aria-label={`Read more: ${article.title}`}
                    className="mt-7"
                  >
                    Read more
                  </Button>
                </article>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 2: Rewrite the article wrapper**

Replace the contents of `apps/web/src/app/blog/wrapper.tsx` with:

```tsx
import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { MDXComponents } from '@/components/MDXComponents'
import { PageHero } from '@/components/PageHero'
import { PageLinks } from '@/components/PageLinks'
import { RootLayout } from '@/components/RootLayout'
import { formatDate } from '@/lib/formatDate'
import { type Article, type MDXEntry, loadArticles } from '@/lib/mdx'

export default async function BlogArticleWrapper({
  article,
  children,
}: {
  article: MDXEntry<Article>
  children: React.ReactNode
}) {
  let allArticles = await loadArticles()
  let moreArticles = allArticles
    .filter(({ metadata }) => metadata !== article)
    .slice(0, 2)

  return (
    <RootLayout>
      <article>
        <PageHero title={article.title}>
          <p>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </p>
          <p className="font-semibold">
            by {article.author.name}, {article.author.role}
          </p>
        </PageHero>

        <Band tone="cream">
          <Container>
            <FadeIn>
              <MDXComponents.wrapper>{children}</MDXComponents.wrapper>
            </FadeIn>
          </Container>
        </Band>
      </article>

      {moreArticles.length > 0 && (
        <PageLinks title="More articles" pages={moreArticles} />
      )}

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 3: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 4: Check in a browser**

Open `http://localhost:3000/blog` and one article from it: the index shows cream article cards on sand; the article page has a warm gradient hero with the title, date, and by-line, the article body on cream in Outfit with Fraunces headings, and a sand "More articles" band with two cards.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/blog/page.tsx apps/web/src/app/blog/wrapper.tsx
git commit -m "feat(web): redesign blog index and article pages"
```

---

### Task 12: Work index and case study pages

**Files:**
- Modify: `apps/web/src/app/work/page.tsx`
- Modify: `apps/web/src/app/work/wrapper.tsx`

- [ ] **Step 1: Rewrite the work index**

Replace the contents of `apps/web/src/app/work/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Blockquote } from '@/components/Blockquote'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { Testimonial } from '@/components/Testimonial'
import logoBrightPath from '@/images/clients/bright-path/logo-dark.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-dark.svg'
import logoGreenLife from '@/images/clients/green-life/logo-dark.svg'
import logoHomeWork from '@/images/clients/home-work/logo-dark.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-dark.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-dark.svg'
import logoPhobia from '@/images/clients/phobia/logo-dark.svg'
import logoUnseal from '@/images/clients/unseal/logo-dark.svg'
import { formatDate } from '@/lib/formatDate'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

function CaseStudies({
  caseStudies,
}: {
  caseStudies: Array<MDXEntry<CaseStudy>>
}) {
  return (
    <Band tone="cream">
      <Container>
        <FadeIn>
          <h2 className="type-display text-[clamp(3.25rem,6vw,5.5rem)]">
            Case studies
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-4.5">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.client}>
              <article className="grid gap-8 rounded-[2.75rem] bg-sand p-8 split:grid-cols-[16rem_1fr] split:p-10">
                <div>
                  <Image
                    src={caseStudy.logo}
                    alt=""
                    className="size-16"
                    unoptimized
                  />
                  <h3 className="mt-5 text-lg font-bold">{caseStudy.client}</h3>
                  <p className="mt-1 text-sm text-warm-muted">
                    {caseStudy.service}
                  </p>
                  <p className="mt-1 text-sm text-warm-muted">
                    <time dateTime={caseStudy.date}>
                      {formatDate(caseStudy.date)}
                    </time>
                  </p>
                </div>
                <div className="max-w-2xl">
                  <p className="type-display text-[clamp(2.25rem,3.6vw,3.25rem)]">
                    <Link href={caseStudy.href}>{caseStudy.title}</Link>
                  </p>
                  <div className="mt-5 space-y-5 text-base/[1.6] text-warm-muted">
                    {caseStudy.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <Button
                    href={caseStudy.href}
                    size="sm"
                    aria-label={`Read case study: ${caseStudy.client}`}
                    className="mt-7"
                  >
                    Read case study
                  </Button>
                  {caseStudy.testimonial && (
                    <Blockquote
                      author={caseStudy.testimonial.author}
                      className="mt-10"
                    >
                      {caseStudy.testimonial.content}
                    </Blockquote>
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Band>
  )
}

const clients = [
  ['Phobia', logoPhobia],
  ['Family Fund', logoFamilyFund],
  ['Unseal', logoUnseal],
  ['Mail Smirk', logoMailSmirk],
  ['Home Work', logoHomeWork],
  ['Green Life', logoGreenLife],
  ['Bright Path', logoBrightPath],
  ['North Adventures', logoNorthAdventures],
]

function Clients() {
  return (
    <Band tone="sand">
      <Container>
        <FadeIn>
          <h2 className="type-display text-[clamp(3.25rem,6vw,5.5rem)]">
            You’re in good company
          </h2>
        </FadeIn>
        <FadeInStagger faster>
          <ul role="list" className="mt-10 grid grid-cols-2 gap-3 split:grid-cols-4">
            {clients.map(([client, logo]) => (
              <li key={client}>
                <FadeIn className="grid h-28 place-items-center rounded-[2rem] bg-warm-cream px-6">
                  <Image src={logo} alt={client} unoptimized />
                </FadeIn>
              </li>
            ))}
          </ul>
        </FadeInStagger>
      </Container>
    </Band>
  )
}

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'We believe in efficiency and maximizing our resources to provide the best value to our clients.',
}

export default async function Work() {
  let caseStudies = await loadCaseStudies()

  return (
    <RootLayout>
      <PageHero kicker="Our work" title="Proven solutions for real-world problems.">
        <p>
          We believe in efficiency and maximizing our resources to provide the
          best value to our clients. The primary way we do that is by re-using
          the same five projects we’ve been developing for the past decade.
        </p>
      </PageHero>

      <CaseStudies caseStudies={caseStudies} />

      <Testimonial client={{ name: 'Mail Smirk', logo: logoMailSmirk }}>
        We approached <em>Studio</em> because we loved their past work. They
        delivered something remarkably similar in record time.
      </Testimonial>

      <Clients />

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 2: Rewrite the case study wrapper**

Replace the contents of `apps/web/src/app/work/wrapper.tsx` with:

```tsx
import Image from 'next/image'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { MDXComponents } from '@/components/MDXComponents'
import { PageHero } from '@/components/PageHero'
import { PageLinks } from '@/components/PageLinks'
import { RootLayout } from '@/components/RootLayout'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

export default async function CaseStudyLayout({
  caseStudy,
  children,
}: {
  caseStudy: MDXEntry<CaseStudy>
  children: React.ReactNode
}) {
  let allCaseStudies = await loadCaseStudies()
  let moreCaseStudies = allCaseStudies
    .filter(({ metadata }) => metadata !== caseStudy)
    .slice(0, 2)
  let year = caseStudy.date.split('-')[0]

  return (
    <RootLayout>
      <article>
        <PageHero kicker="Case Study" title={caseStudy.title}>
          <p>{caseStudy.description}</p>
        </PageHero>

        <Band tone="cream">
          <Container>
            <FadeIn>
              <dl className="grid gap-3 split:grid-cols-3">
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Client
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {caseStudy.client}
                  </dd>
                </div>
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Year
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    <time dateTime={year}>{year}</time>
                  </dd>
                </div>
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Service
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {caseStudy.service}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 overflow-hidden rounded-[2.75rem] bg-sand">
                <Image
                  {...caseStudy.image}
                  alt=""
                  quality={90}
                  sizes="(min-width: 1216px) 76rem, 100vw"
                  priority
                  className="photo-warm w-full"
                />
              </div>
            </FadeIn>
            <FadeIn className="mt-20">
              <MDXComponents.wrapper>{children}</MDXComponents.wrapper>
            </FadeIn>
          </Container>
        </Band>
      </article>

      {moreCaseStudies.length > 0 && (
        <PageLinks title="More case studies" pages={moreCaseStudies} />
      )}

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 3: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 4: Check in a browser**

Open `http://localhost:3000/work` and one case study: sand case-study cards on cream, an apricot testimonial band, cream logo tiles on sand; the case study page shows three sand info pills, a rounded warm-graded hero image, the body on cream, and a "More case studies" band.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/work/page.tsx apps/web/src/app/work/wrapper.tsx
git commit -m "feat(web): redesign work index and case study pages"
```

---

### Task 13: Process and Not found pages

**Files:**
- Modify: `apps/web/src/app/process/page.tsx`
- Modify: `apps/web/src/app/not-found.tsx`

- [ ] **Step 1: Rewrite the Process page (copy unchanged)**

Replace the contents of `apps/web/src/app/process/page.tsx` with:

```tsx
import { type Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Blockquote } from '@/components/Blockquote'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { TagList, TagListItem } from '@/components/TagList'
import { ValueCards } from '@/components/ValueCards'
import imageLaptop from '@/images/laptop.jpg'
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'

function Section({
  index,
  title,
  image,
  children,
}: {
  index: number
  title: string
  image: StaticImageData
  children: React.ReactNode
}) {
  return (
    <div className="grid items-center gap-10 split:grid-cols-2 split:gap-16">
      <FadeIn
        className={clsx(
          'relative aspect-4/3 overflow-hidden rounded-[2.75rem]',
          index % 2 === 0 && 'split:order-last',
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 900px) 50vw, 100vw"
          className="photo-warm object-cover"
        />
      </FadeIn>
      <FadeIn>
        <NumberBadge value={index} tone="sun" />
        <h2 className="type-display mt-5 text-[clamp(2.75rem,5vw,4.5rem)]">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </FadeIn>
    </div>
  )
}

function Discover() {
  return (
    <Section index={1} title="Discover" image={imageWhiteboard}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          We work closely with our clients to understand their{' '}
          <strong className="font-semibold text-warm-ink">needs</strong> and
          goals, embedding ourselves in their every day operations to understand
          what makes their business tick.
        </p>
        <p>
          Our team of private investigators shadow the company director’s for
          several weeks while our account managers focus on going through their
          trash. Our senior security experts then perform social engineering
          hacks to gain access to their{' '}
          <strong className="font-semibold text-warm-ink">business</strong>{' '}
          accounts — handing that information over to our forensic accounting
          team.
        </p>
        <p>
          Once the full audit is complete, we report back with a comprehensive{' '}
          <strong className="font-semibold text-warm-ink">plan</strong> and,
          more importantly, a budget.
        </p>
      </div>

      <h3 className="mt-12 text-lg font-bold text-warm-ink">
        Included in this phase
      </h3>
      <TagList className="mt-4">
        <TagListItem>In-depth questionnaires</TagListItem>
        <TagListItem>Feasibility studies</TagListItem>
        <TagListItem>Blood samples</TagListItem>
        <TagListItem>Employee surveys</TagListItem>
        <TagListItem>Proofs-of-concept</TagListItem>
        <TagListItem>Forensic audit</TagListItem>
      </TagList>
    </Section>
  )
}

function Build() {
  return (
    <Section index={2} title="Build" image={imageLaptop}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          Based off of the discovery phase, we develop a comprehensive roadmap
          for each product and start working towards delivery. The roadmap is an
          intricately tangled mess of technical nonsense designed to drag the
          project out as long as possible.
        </p>
        <p>
          Each client is assigned a key account manager to keep lines of
          communication open and obscure the actual progress of the project.
          They act as a buffer between the client’s incessant nagging and the
          development team who are hard at work scouring open source projects
          for code to re-purpose.
        </p>
        <p>
          Our account managers are trained to only reply to client emails after
          9pm, several days after the initial email. This reinforces the general
          aura that we are very busy and dissuades clients from asking for
          changes.
        </p>
      </div>

      <Blockquote
        author={{ name: 'Debra Fiscal', role: 'CEO of Unseal' }}
        className="mt-12"
      >
        Studio were so regular with their progress updates we almost began to
        think they were automated!
      </Blockquote>
    </Section>
  )
}

function Deliver() {
  return (
    <Section index={3} title="Deliver" image={imageMeeting}>
      <div className="space-y-6 text-base text-warm-muted">
        <p>
          About halfway through the Build phase, we push each project out by 6
          weeks due to a change in{' '}
          <strong className="font-semibold text-warm-ink">requirements</strong>
          . This allows us to increase the budget a final time before launch.
        </p>
        <p>
          Despite largely using pre-built components, most of the{' '}
          <strong className="font-semibold text-warm-ink">progress</strong> on
          each project takes place in the final 24 hours. The development time
          allocated to each client is actually spent making augmented reality
          demos that go viral on social media.
        </p>
        <p>
          We ensure that the main pages of the site are{' '}
          <strong className="font-semibold text-warm-ink">
            fully functional
          </strong>{' '}
          at launch — the auxiliary pages will, of course, be lorem ipusm shells
          which get updated as part of our exorbitant{' '}
          <strong className="font-semibold text-warm-ink">maintenance</strong>{' '}
          retainer.
        </p>
      </div>

      <h3 className="mt-12 text-lg font-bold text-warm-ink">
        Included in this phase
      </h3>
      <List className="mt-8">
        <ListItem title="Testing">
          Our projects always have 100% test coverage, which would be impressive
          if our tests weren’t as porous as a sieve.
        </ListItem>
        <ListItem title="Infrastructure">
          To ensure reliability we only use the best Digital Ocean droplets that
          $4 a month can buy.
        </ListItem>
        <ListItem title="Support">
          Because we hold the API keys for every critical service your business
          uses, you can expect a lifetime of support, and invoices, from us.
        </ListItem>
      </List>
    </Section>
  )
}

const values = [
  {
    title: 'Meticulous',
    description:
      'The first part of any partnership is getting our designer to put your logo in our template. The second step is getting them to do the colors.',
  },
  {
    title: 'Efficient',
    description:
      'We pride ourselves on never missing a deadline which is easy because most of the work was done years ago.',
  },
  {
    title: 'Adaptable',
    description:
      'Every business has unique needs and our greatest challenge is shoe-horning those needs into something we already built.',
  },
  {
    title: 'Honest',
    description:
      'We are transparent about all of our processes, banking on the simple fact our clients never actually read anything.',
  },
  {
    title: 'Loyal',
    description:
      'We foster long-term relationships with our clients that go beyond just delivering a product, allowing us to invoice them for decades.',
  },
  {
    title: 'Innovative',
    description:
      'The technological landscape is always evolving and so are we. We are constantly on the lookout for new open source projects to clone.',
  },
]

function Values() {
  return (
    <Band tone="forest">
      <Container>
        <SectionHead
          tone="dark"
          kicker="Our values"
          title="Balancing reliability and innovation"
        >
          <p>
            We strive to stay at the forefront of emerging trends and
            technologies, while completely ignoring them and forking that old
            Rails project we feel comfortable using. We stand by our core values
            to justify that decision.
          </p>
        </SectionHead>
        <ValueCards items={values} />
      </Container>
    </Band>
  )
}

export const metadata: Metadata = {
  title: 'Our Process',
  description:
    'We believe in efficiency and maximizing our resources to provide the best value to our clients.',
}

export default function Process() {
  return (
    <RootLayout>
      <PageHero kicker="Our process" title="How we work">
        <p>
          We believe in efficiency and maximizing our resources to provide the
          best value to our clients. The primary way we do that is by re-using
          the same five projects we’ve been developing for the past decade.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container className="space-y-24 split:space-y-32">
          <Discover />
          <Build />
          <Deliver />
        </Container>
      </Band>

      <Values />

      <ContactSection />
    </RootLayout>
  )
}
```

- [ ] **Step 2: Rewrite the Not found page**

Replace the contents of `apps/web/src/app/not-found.tsx` with:

```tsx
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-auto items-center overflow-hidden text-warm-cream">
      <div aria-hidden="true" className="hero-fill absolute inset-0 -z-20" />
      <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />
      <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10" />
      <Container>
        <FadeIn className="flex max-w-xl flex-col items-start">
          <p className="type-display text-[clamp(6rem,14vw,11rem)]">404</p>
          <h1 className="type-display mt-2 text-5xl">Page not found</h1>
          <p className="mt-4 text-lg text-[#fbeedd]">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <Button href="/" arrow className="mt-8">
            Go to the home page
          </Button>
        </FadeIn>
      </Container>
    </main>
  )
}
```

- [ ] **Step 3: Verify types, lint, and copy**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines. The 404 route now has a `<main>`; its words match the baseline, which was taken from `<body>`.

- [ ] **Step 4: Check the 404 page in a browser**

Open `http://localhost:3000/this-page-does-not-exist`: a full-screen warm gradient with a huge "404", "Page not found", the message, and a sun pill back home. (The Process page redirects to `/property-management` and cannot be opened; typecheck and lint cover it.)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/process/page.tsx apps/web/src/app/not-found.tsx
git commit -m "feat(web): redesign process and not-found pages"
```

---

### Task 14: Remove template components that are no longer used

**Files:**
- Delete: `apps/web/src/components/PageIntro.tsx`
- Delete: `apps/web/src/components/SectionIntro.tsx`
- Delete: `apps/web/src/components/GridList.tsx`
- Delete: `apps/web/src/components/StylizedImage.tsx`
- Delete: `apps/web/src/components/GridPattern.tsx`
- Delete: `apps/web/src/components/GrayscaleTransitionImage.tsx`

- [ ] **Step 1: Confirm nothing imports them**

```bash
rg "components/(PageIntro|SectionIntro|GridList|StylizedImage|GridPattern|GrayscaleTransitionImage)" apps/web/src apps/web/mdx-components.tsx
```

Expected: no output. If anything prints, that file still uses a template component — go back to the task that owns it and finish the rewrite before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm apps/web/src/components/PageIntro.tsx apps/web/src/components/SectionIntro.tsx apps/web/src/components/GridList.tsx apps/web/src/components/StylizedImage.tsx apps/web/src/components/GridPattern.tsx apps/web/src/components/GrayscaleTransitionImage.tsx
```

- [ ] **Step 3: Verify**

```bash
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web check:copy
```

Expected: no errors; 14 `ok` lines.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(web): remove unused template components"
```

---

### Task 15: Full verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: Static checks and builds**

```bash
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web typecheck
pnpm --filter ./apps/web build
pnpm --filter ./apps/admin build
```

Expected: all four exit 0.

- [ ] **Step 2: Copy guard**

```bash
pnpm --filter ./apps/web check:copy
```

Expected: 14 `ok` lines.

- [ ] **Step 3: Admin is unchanged**

Check out `main` in a separate worktree (`git worktree add ../strat-summit-main main`, then `pnpm install` there). Run `pnpm --filter ./apps/admin dev` in both checkouts on different ports and open each login page side by side. They must look identical: Inter, same colours, same layout. Remove the worktree afterwards with `git worktree remove ../strat-summit-main`.

- [ ] **Step 4: Browser pass at four widths**

For each route — `/`, `/property-management`, `/renovations`, `/about`, `/contact`, `/blog`, one blog article, `/work`, one case study, `/this-page-does-not-exist` — at 375px, 768px, 1280px, and 1920px wide, confirm:

- No horizontal scrollbar.
- Each band's rounded top overlaps the section above, and no text or button is hidden under an overlap.
- Hero text is readable over its photo or gradient.
- At 375px and 768px the header shows the "Menu" pill; at 1280px and 1920px it shows the three links and "Get in touch".

- [ ] **Step 5: Contrast spot checks**

In the browser devtools colour picker (or any contrast checker), check these pairs and confirm each meets the stated ratio:

| Foreground | Background | Minimum |
|------------|------------|---------|
| Kicker `#9a4a16` | sand `#f7e3c4` | 4.5:1 |
| Muted text `#6a5646` | sand `#f7e3c4` | 4.5:1 |
| Ink `#2a2118` | sun `#f2a33a` | 4.5:1 |
| Apricot kicker `#f3c98f` | forest `#1f4a35` | 4.5:1 |
| Cream hero lede `#fbeedd` | the lightest pixel behind it on `/` and `/renovations` | 4.5:1 |
| Cream hero headline | the lightest pixel behind it on `/`, `/renovations`, `/about` | 3:1 |

If a hero pair fails, strengthen the left stop of `hero-shade` in `apps/web/src/styles/warm.css` (currently `0.66`; for example raise it to `0.72`) and re-check.

- [ ] **Step 6: Keyboard and motion**

- Tab through `/` from the top: every link and button shows a visible focus outline.
- At 375px, open the menu with the keyboard (Tab to "Menu", press Enter): focus moves to "Close"; `Escape` closes it and focus returns to "Menu".
- With the OS "Reduce motion" setting on, reload `/` in a private window: the splash disappears in well under a second and sections appear without sliding.

- [ ] **Step 7: Final commit (only if a check required a fix)**

```bash
git add <the files you fixed>
git commit -m "fix(web): address redesign verification findings"
```
