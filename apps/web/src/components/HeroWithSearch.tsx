'use client'

import { Suspense, useId, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import clsx from 'clsx'

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

function SearchFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const checkInId = useId()
  const checkOutId = useId()
  const guestsId = useId()

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(searchParams.get('guests') || '2')

  function handleSearch() {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    router.push(`/stays?${params.toString()}`)
  }

  const inputClasses =
    'rounded-2xl border-2 border-warm-ink/10 bg-white px-5 py-3.5 text-base font-medium text-warm-ink transition placeholder:text-warm-ink/40 focus:border-sun focus:outline-none'

  const labelClasses = 'text-sm font-bold text-warm-ink/70'

  return (
    <div className="mx-auto w-full max-w-4xl rounded-[2.75rem] bg-white p-8 shadow-[0_12px_32px_rgb(42_24_10/0.12)] split:p-10">
      <div className="grid gap-6 split:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <label htmlFor={checkInId} className={labelClasses}>
            Check-in
          </label>
          <input
            id={checkInId}
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={clsx(inputClasses, 'mt-1.5 w-full')}
          />
        </div>

        <div>
          <label htmlFor={checkOutId} className={labelClasses}>
            Check-out
          </label>
          <input
            id={checkOutId}
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className={clsx(inputClasses, 'mt-1.5 w-full')}
          />
        </div>

        <div>
          <label htmlFor={guestsId} className={labelClasses}>
            Guests
          </label>
          <select
            id={guestsId}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={clsx(inputClasses, 'mt-1.5 w-full')}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button onClick={handleSearch} size="md" tone="sun">
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}

function SearchForm() {
  return (
    <Suspense fallback={<div className="h-[140px]" />}>
      <SearchFormInner />
    </Suspense>
  )
}

export function HeroWithSearch() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-forest-warm text-warm-cream">
      {/* Background Image */}
      <Image
        src="/HeroImage.jpg"
        alt="Mount Washington alpine landscape"
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
            Your mountain escape.
            <br />
            Book direct. Save more.
          </h1>
          <p className="mx-auto mt-8 max-w-[48ch] text-[1.1875rem]/[1.55] text-warm-cream/90">
            Experience Mount Washington from our thoughtfully managed vacation
            rentals. Best rates guaranteed when you book directly with us.
          </p>
        </FadeIn>

        <div className="mt-14">
          <SearchForm />
        </div>

        {/* Partner Marquee */}
        <PartnerMarquee />
      </div>
    </div>
  )
}
