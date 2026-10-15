'use client'

import { Suspense, useId, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import clsx from 'clsx'

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
    'rounded-2xl border-2 border-warm-ink/8 bg-warm-cream/40 px-5 py-4 text-base font-medium text-warm-ink transition placeholder:text-warm-ink/40 focus:border-sun focus:bg-white focus:outline-none'

  const labelClasses = 'text-sm font-bold tracking-wide text-warm-ink/60 uppercase'

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[3rem] bg-white p-6 shadow-[0_16px_48px_rgb(42_24_10/0.15),0_4px_12px_rgb(42_24_10/0.08)] sm:p-8 split:p-12">
      <div className="grid gap-5 sm:gap-8 split:grid-cols-[1fr_1fr_auto_auto] split:gap-6">
        <div className="min-w-0">
          <label htmlFor={checkInId} className={labelClasses}>
            Check-in
          </label>
          <input
            id={checkInId}
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={clsx(inputClasses, 'mt-2.5 w-full min-w-0')}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={checkOutId} className={labelClasses}>
            Check-out
          </label>
          <input
            id={checkOutId}
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className={clsx(inputClasses, 'mt-2.5 w-full min-w-0')}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor={guestsId} className={labelClasses}>
            Guests
          </label>
          <select
            id={guestsId}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={clsx(inputClasses, 'mt-2.5 w-full min-w-0')}
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
      <div className="mx-auto flex w-full max-w-[78rem] flex-1 flex-col px-6 pt-44 pb-[calc(var(--band-radius)+6rem)] split:px-12 split:pt-52">
        <FadeIn className="text-center">
          <h1 className="type-display text-[clamp(2.75rem,7.5vw,5.5rem)] text-balance">
            Stay close to adventure.
            <br />
            Settle into comfort.
          </h1>
          <p className="mx-auto mt-10 max-w-[50ch] text-[1.25rem]/[1.6] text-warm-cream/90">
            Discover Mount Washington chalets and condos, thoughtfully prepared
            and hosted by a local team who know and love the mountain.
          </p>
        </FadeIn>

        <div className="mt-16">
          <SearchForm />
        </div>
      </div>
    </div>
  )
}
