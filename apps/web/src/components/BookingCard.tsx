'use client'

import { useState } from 'react'
import { Button } from '@/components/Button'
import { buildCheckoutUrl } from '@/lib/hostaway'

type BookingCardProps = {
  listingId: string
  maxGuests: number
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

// No prices are shown on the site; guests see the full quote at checkout.
export function BookingCard({
  listingId,
  maxGuests,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
}: BookingCardProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn || '')
  const [checkOut, setCheckOut] = useState(initialCheckOut || '')
  const [guests, setGuests] = useState(Math.min(initialGuests, maxGuests))
  const canBook = checkIn && checkOut && guests > 0

  const handleBookNow = () => {
    if (!canBook) return

    const url = buildCheckoutUrl(listingId, checkIn, checkOut, guests)
    window.location.href = url
  }

  // Get minimum date for check-in (today)
  const today = new Date().toISOString().split('T')[0]

  // Get minimum date for check-out (day after check-in)
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : today

  return (
    <div className="overflow-hidden rounded-[2.75rem] bg-white p-8 ring-1 ring-warm-ink/8 shadow-[0_12px_40px_rgb(22_56_38/0.06)] split:sticky split:top-28">
      <div className="mb-6">
        <h2 className="type-display text-[clamp(1.75rem,3vw,2rem)] text-warm-ink">
          Book your stay
        </h2>
        <p className="mt-1 text-sm text-warm-ink/60">
          Choose your dates to check availability.
        </p>
      </div>

      {/* Date inputs */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label
            htmlFor="check-in"
            className="mb-1 block text-xs font-semibold uppercase text-warm-ink/60"
          >
            Check-in
          </label>
          <input
            type="date"
            id="check-in"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="w-full min-w-0 rounded-2xl border-2 border-warm-ink/10 bg-warm-cream/50 px-3 py-2.5 text-sm font-medium text-warm-ink transition focus:border-forest-warm focus:outline-none"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor="check-out"
            className="mb-1 block text-xs font-semibold uppercase text-warm-ink/60"
          >
            Check-out
          </label>
          <input
            type="date"
            id="check-out"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={minCheckOut}
            className="w-full min-w-0 rounded-2xl border-2 border-warm-ink/10 bg-warm-cream/50 px-3 py-2.5 text-sm font-medium text-warm-ink transition focus:border-forest-warm focus:outline-none"
          />
        </div>
      </div>

      {/* Guest selector */}
      <div className="mb-6">
        <label
          htmlFor="guests"
          className="mb-1 block text-xs font-semibold uppercase text-warm-ink/60"
        >
          Guests
        </label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="w-full rounded-2xl border-2 border-warm-ink/10 bg-warm-cream/50 px-4 py-3 text-sm font-medium text-warm-ink transition focus:border-forest-warm focus:outline-none"
        >
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Book now button */}
      <Button
        onClick={handleBookNow}
        disabled={!canBook}
        tone="forest"
        size="md"
        className="w-full justify-center"
        arrow
      >
        Check Availability
      </Button>

      <p className="mt-4 text-center text-xs text-warm-ink/60">
        You won't be charged yet
      </p>
    </div>
  )
}
