'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { Kicker } from '@/components/Kicker'
import { cn } from '@/lib/utils'

const heights = {
  full: 'min-h-[calc(100svh-4.5rem)]',
  page: 'min-h-[36rem] md:min-h-[44rem]',
  short: 'min-h-[26rem] md:min-h-[32rem]',
}

const titleSizes = {
  full: 'text-4xl sm:text-5xl md:text-6xl lg:text-8xl lg:leading-[1.02]',
  page: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.03]',
  short: 'text-4xl sm:text-5xl md:text-6xl',
}

// Adapted from Aceternity's "hero with background and navbar" block. The site
// header stays as the navbar; the hero keeps the framing rules and the photo
// that fades into white so the type sits on a clean surface. The homepage
// uses the full-height version; inner pages use the shorter sizes.
export function HeroWithBackground({
  kicker,
  title,
  intro,
  image,
  size = 'full',
  primaryAction,
  secondaryAction,
  actions,
}: {
  kicker?: string
  title: string
  intro?: React.ReactNode
  image?: { src: string; alt: string; position?: string }
  size?: keyof typeof heights
  primaryAction?: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
  actions?: React.ReactNode
}) {
  return (
    <section className="relative w-full">
      <div
        className={cn(
          'relative flex w-full flex-col justify-end p-4 md:p-14',
          // Without a photo there is nothing to frame above the title.
          image ? heights[size] : 'min-h-[20rem] md:min-h-[26rem]',
        )}
      >
        {image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-4 overflow-hidden md:inset-10"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="100vw"
              className="mask-t-from-50% mask-b-from-75% mask-l-from-65% object-cover"
              style={{ objectPosition: image.position ?? 'center' }}
            />
            {/* On narrow screens the copy spans the photo, so lift it to white. */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-white via-white/85 to-transparent md:hidden" />
            {/* On wider screens only the copy's corner is lifted, so the rest of
                the photo keeps its full strength. */}
            <div className="absolute bottom-0 left-0 hidden h-3/5 w-3/4 bg-[radial-gradient(ellipse_farthest-side_at_bottom_left,white_45%,rgb(255_255_255/0.6)_65%,transparent_95%)] md:block" />
          </motion.div>
        )}
        <Scales />
        <div className="relative z-10 p-4">
          {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
          <h1
            className={cn(
              'max-w-4xl font-semibold tracking-[-0.035em] text-balance text-ink',
              titleSizes[size],
            )}
          >
            {title}
          </h1>
          {intro && (
            <div className="mt-4 max-w-xl space-y-4 text-base text-muted md:mt-6 md:text-lg">
              {intro}
            </div>
          )}
          {(primaryAction || secondaryAction || actions) && (
            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center md:mt-10">
              {primaryAction && (
                <HeroButton href={primaryAction.href}>
                  {primaryAction.label}
                </HeroButton>
              )}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className="text-sm font-medium text-muted transition hover:text-ink"
                >
                  {secondaryAction.label} &rarr;
                </Link>
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Scales() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-4 h-px w-full bg-line md:top-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 h-px w-full bg-line md:bottom-10" />
      <div className="pointer-events-none absolute inset-y-0 left-4 h-full w-px bg-line md:left-10" />
      <div className="pointer-events-none absolute inset-y-0 right-4 h-full w-px bg-line md:right-10" />
    </>
  )
}

// On hover the highlight tile slides across and spins a full turn (so the arrow
// still points forward), and the label shifts left to make room for it.
export function HeroButton({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group/button relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-accent py-2.5 pr-4 pl-12 font-medium tracking-tight focus-visible:-outline-offset-4',
        className,
      )}
    >
      <Box />
      <div className="absolute -inset-px rounded-lg bg-white/15 transition-[clip-path] duration-400 ease-out [clip-path:inset(0_100%_0_0)] group-hover/button:[clip-path:inset(0_0%_0_0)]" />
      <span className="inline-block text-white transition-transform duration-400 group-hover/button:-translate-x-8">
        {children}
      </span>
    </Link>
  )
}

function Box() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 left-1 z-10 my-auto flex size-8 flex-col items-center justify-center gap-px rounded-[5px] bg-highlight transition-all duration-400 ease-out group-hover/button:left-[calc(100%-2.3rem)] group-hover/button:rotate-360"
    >
      <BubblesGroup />
    </div>
  )
}

// A 5x5 dot matrix drawing a right-pointing arrow.
const ARROW = [
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
]

function BubblesGroup() {
  return (
    <div className="flex flex-col gap-px">
      {ARROW.map((row, i) => (
        <div key={i} className="flex gap-px">
          {row.map((on, j) => (
            <Bubble key={j} highlight={on === 1} />
          ))}
        </div>
      ))}
    </div>
  )
}

function Bubble({ highlight }: { highlight?: boolean }) {
  return (
    <span
      className={cn(
        'inline-block size-[3px] shrink-0 rounded-full bg-white/40',
        highlight && 'animate-pulse bg-accent-deep duration-200 ease-linear',
      )}
    />
  )
}
