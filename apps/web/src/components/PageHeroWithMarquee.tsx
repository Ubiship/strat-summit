'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { FadeIn } from '@/components/FadeIn'

// Partner platforms
const PARTNERS = [
  { name: 'Airbnb', color: '#FF5A5F' },
  { name: 'VRBO', color: '#0052CC' },
  { name: 'Booking.com', color: '#003580' },
  { name: 'Hostaway', color: '#1f4a35' },
  { name: 'Expedia', color: '#FFCC00' },
  { name: 'TripAdvisor', color: '#34E0A1' },
  { name: 'Google', color: '#4285F4' },
]

function ShimmerChip({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <span className="mx-1 inline-block rounded-full bg-white/20 px-3 py-1 font-bold text-warm-cream">
        {children}
      </span>
    )
  }

  return (
    <motion.span
      className="mx-1 inline-block rounded-full bg-white/20 px-3 py-1 font-bold"
      style={{
        backgroundImage:
          'linear-gradient(100deg, #fdf5e8 40%, #f2a33a 50%, #fdf5e8 60%)',
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: '150% 0%' }}
      animate={{ backgroundPosition: '-50% 0%' }}
      transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity }}
    >
      {children}
    </motion.span>
  )
}

function PartnerMarquee() {
  const reduceMotion = useReducedMotion()

  const LogoRow = ({ hidden }: { hidden?: boolean }) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-10 pr-10 split:gap-14 split:pr-14"
    >
      {PARTNERS.map(({ name, color }) => (
        <div
          key={name}
          className="flex items-center gap-2.5 whitespace-nowrap text-base font-semibold text-warm-cream/80 split:text-lg"
        >
          <span
            className="size-2.5 shrink-0 rounded-full split:size-3"
            style={{ backgroundColor: color }}
          />
          {name}
        </div>
      ))}
    </div>
  )

  return (
    <div className="mt-auto w-full pb-8 pt-12">
      <p className="text-center text-sm text-warm-cream/70">
        Synced with <ShimmerChip>7+ platforms</ShimmerChip> so your calendar is
        always up to date
      </p>
      <div
        className="relative mt-6 w-full overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <motion.div
          className="flex w-max"
          animate={reduceMotion ? undefined : { x: ['0%', '-33.333%'] }}
          transition={{
            x: {
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
            },
          }}
        >
          <LogoRow />
          <LogoRow hidden />
          <LogoRow hidden />
        </motion.div>
      </div>
    </div>
  )
}

interface PageHeroWithMarqueeProps {
  title: string
  subtitle?: string
  image?: string
  imageAlt?: string
  children?: React.ReactNode
}

export function PageHeroWithMarquee({
  title,
  subtitle,
  image = '/HeroImage.jpg',
  imageAlt = 'Mount Washington alpine landscape',
  children,
}: PageHeroWithMarqueeProps) {
  return (
    <div className="relative isolate flex min-h-[85vh] flex-col overflow-hidden bg-forest-warm text-warm-cream">
      {/* Background Image */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover photo-warm"
      />

      {/* Overlay */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 tile-shade" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-[75rem] flex-1 flex-col px-6 pt-40 pb-[calc(var(--band-radius)+5rem)] split:px-10 split:pt-48">
        <FadeIn className="text-center">
          <h1 className="type-display text-[clamp(3rem,8vw,6rem)] text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-8 max-w-[48ch] text-[1.1875rem]/[1.55] text-warm-cream/90">
              {subtitle}
            </p>
          )}
          {children}
        </FadeIn>

        {/* Partner Marquee */}
        <PartnerMarquee />
      </div>
    </div>
  )
}
