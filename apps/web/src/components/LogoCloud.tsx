'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import clsx from 'clsx'

type TileTone = 'light' | 'dark' | 'accent'

type EmptyTile = { kind: 'empty' }

type LogoTile = {
  kind: 'logo'
  name: string
  slug?: string
  tone: TileTone
  brandColor?: string
  customSvg?: React.ReactNode
}

type Item = EmptyTile | LogoTile

type MarqueeRowConfig = {
  speed: number
  reverse: boolean
  items: Item[]
}

function empty(): EmptyTile {
  return { kind: 'empty' }
}

function mark(
  name: string,
  slug: string,
  tone: Exclude<TileTone, 'accent'>,
  brandColor?: string,
): LogoTile {
  return {
    kind: 'logo',
    name,
    slug,
    tone,
    brandColor,
  }
}

function custom(
  name: string,
  tone: TileTone,
  customSvg: React.ReactNode,
): LogoTile {
  return {
    kind: 'logo',
    name,
    tone,
    customSvg,
  }
}

// Hostaway custom logo SVG
function HostawayIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <path
        d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4a2 2 0 110 4 2 2 0 010-4zm-4 6h8v2h-3v8h-2v-8h-3v-2z"
        fill="currentColor"
      />
    </svg>
  )
}

// VRBO custom logo SVG (house icon)
function VrboIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-full">
      <path
        d="M24 4L4 20h6v20h28V20h6L24 4zm0 6.5L36 20v16H12V20l12-9.5z"
        fill="#0052CC"
      />
      <rect x="20" y="26" width="8" height="10" fill="#0052CC" />
    </svg>
  )
}

// Strathcona Summit accent mark
function AccentMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[55%] text-white"
    >
      <path
        d="M12 2L2 12l10 10 10-10L12 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}

// Vacation rental platforms
const ROWS: MarqueeRowConfig[] = [
  {
    speed: 28,
    reverse: false,
    items: [
      empty(),
      mark('Airbnb', 'airbnb', 'light', 'FF5A5F'),
      custom('VRBO', 'light', <VrboIcon />),
      empty(),
      mark('Booking.com', 'bookingdotcom', 'light', '003580'),
      empty(),
      custom('Hostaway', 'accent', <HostawayIcon />),
      mark('Expedia', 'expedia', 'light', 'FFCC00'),
      empty(),
      mark('TripAdvisor', 'tripadvisor', 'light', '34E0A1'),
      mark('Google', 'google', 'light', '4285F4'),
      empty(),
    ],
  },
  {
    speed: 32,
    reverse: true,
    items: [
      empty(),
      custom('VRBO', 'light', <VrboIcon />),
      empty(),
      mark('Airbnb', 'airbnb', 'light', 'FF5A5F'),
      mark('Booking.com', 'bookingdotcom', 'light', '003580'),
      empty(),
      mark('Expedia', 'expedia', 'light', 'FFCC00'),
      empty(),
      mark('TripAdvisor', 'tripadvisor', 'light', '34E0A1'),
      custom('Hostaway', 'accent', <HostawayIcon />),
      empty(),
      mark('Google', 'google', 'light', '4285F4'),
      empty(),
    ],
  },
]

// Simple wrap function to loop values within a range
function wrap(min: number, max: number, value: number): number {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

function LogoMark({ item }: { item: LogoTile }) {
  if (item.customSvg) {
    return (
      <div className="flex size-full items-center justify-center text-forest-warm">
        {item.customSvg}
      </div>
    )
  }

  if (!item.slug) {
    return null
  }

  const lightSrc = `https://cdn.simpleicons.org/${item.slug}/${item.brandColor ?? '2a2118'}`

  if (item.tone !== 'dark') {
    return (
      <img
        src={lightSrc}
        alt={item.name}
        width={48}
        height={48}
        draggable={false}
        className="size-full object-contain select-none"
      />
    )
  }

  const darkSrc = `https://cdn.simpleicons.org/${item.slug}/fdf5e8`

  return (
    <>
      <img
        src={lightSrc}
        alt={item.name}
        width={48}
        height={48}
        draggable={false}
        className="size-full object-contain select-none dark:hidden"
      />
      <img
        src={darkSrc}
        alt={item.name}
        width={48}
        height={48}
        draggable={false}
        className="hidden size-full object-contain select-none dark:block"
      />
    </>
  )
}

function Tile({ item }: { item: Item }) {
  if (item.kind === 'empty') {
    return (
      <div
        aria-hidden="true"
        className="size-[var(--tile)] shrink-0 rounded-[0.875rem] bg-sand/60 blur-[0.5px] ring-1 ring-inset ring-warm-ink/5"
      />
    )
  }

  return (
    <div
      className={clsx(
        'flex size-[var(--tile)] shrink-0 items-center justify-center rounded-[0.875rem] p-2',
        item.tone === 'light' && 'bg-white ring-1 ring-inset ring-warm-ink/10',
        item.tone === 'dark' && 'bg-sand/80 ring-1 ring-inset ring-warm-ink/5',
        item.tone === 'accent' && 'bg-forest-warm',
      )}
    >
      {item.tone === 'accent' && item.customSvg ? (
        <div className="flex size-[55%] items-center justify-center text-warm-cream">
          {item.customSvg}
        </div>
      ) : item.tone === 'accent' ? (
        <AccentMark />
      ) : (
        <LogoMark item={item} />
      )}
    </div>
  )
}

function TileSequence({ items, hidden }: { items: Item[]; hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)]"
    >
      {items.map((item, index) => (
        <Tile
          key={`${item.kind === 'logo' ? item.name : 'empty'}-${index}`}
          item={item}
        />
      ))}
    </div>
  )
}

function MarqueeRow({ row }: { row: MarqueeRowConfig }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const loopWidthRef = useRef(0)
  const x = useMotionValue(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track) {
      return
    }

    const measure = () => {
      loopWidthRef.current = track.scrollWidth / 2
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) {
      return
    }

    const width = loopWidthRef.current
    if (width <= 0) {
      return
    }

    const direction = row.reverse ? 1 : -1
    const next = x.get() + direction * row.speed * (delta / 1000)
    x.set(wrap(-width, 0, next))
  })

  return (
    <div className="overflow-hidden">
      <motion.div ref={trackRef} style={{ x }} className="flex w-max">
        <TileSequence items={row.items} />
        <TileSequence items={row.items} hidden />
      </motion.div>
    </div>
  )
}

export function LogoCloud() {
  return (
    <section
      aria-labelledby="logo-cloud-heading"
      className="flex flex-col items-center justify-center overflow-x-clip bg-warm-cream py-20 antialiased selection:bg-forest-warm/25 selection:text-warm-ink sm:py-28"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-5 sm:gap-16 sm:px-8">
        <header className="flex flex-col items-center gap-5 sm:gap-6">
          <p className="text-sm font-medium text-forest-warm">
            Trusted Integrations
          </p>
          <h2
            id="logo-cloud-heading"
            className="max-w-[34ch] text-center text-3xl font-medium tracking-tight text-balance text-warm-ink sm:text-4xl lg:text-[2.5rem]"
          >
            Seamlessly connected to the platforms you already use.{' '}
            <span className="text-warm-muted">
              From Airbnb to Hostaway, we integrate with the tools that power
              your vacation rental business.
            </span>
          </h2>
        </header>

        <div className="flex w-full flex-col items-center gap-8 sm:gap-10">
          <div
            aria-label="Vacation rental platforms and integrations"
            className="flex w-full flex-col overflow-hidden py-2 [--gap:0.625rem] [--tile:3.25rem] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:[--tile:3.75rem] lg:[--tile:4.35rem]"
          >
            <div className="flex flex-col gap-[var(--gap)]">
              {ROWS.map((row, rowIndex) => (
                <MarqueeRow key={rowIndex} row={row} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
