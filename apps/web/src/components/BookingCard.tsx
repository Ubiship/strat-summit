'use client'

import { useId, useState } from 'react'

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
  const checkInId = useId()
  const checkOutId = useId()
  const guestsId = useId()

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

  const labelClasses = 'block text-xs font-semibold text-ink'
  const inputClasses =
    'mt-0.5 w-full bg-transparent text-[0.9375rem] text-muted focus:outline-none'

  return (
    <div className="rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_10px_30px_rgb(20_28_34/0.06)] split:sticky split:top-28">
      <h2 className="text-[1.25rem] font-semibold tracking-[-0.015em]">
        Book your stay
      </h2>
      <p className="mt-1 text-sm text-muted">
        Choose your dates to check availability.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="px-4 py-3">
            <label htmlFor={checkInId} className={labelClasses}>
              Check-in
            </label>
            <input
              type="date"
              id={checkInId}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              className={inputClasses}
            />
          </div>
          <div className="px-4 py-3">
            <label htmlFor={checkOutId} className={labelClasses}>
              Check-out
            </label>
            <input
              type="date"
              id={checkOutId}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={minCheckOut}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="border-t border-line px-4 py-3">
          <label htmlFor={guestsId} className={labelClasses}>
            Guests
          </label>
          <select
            id={guestsId}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className={inputClasses}
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleBookNow}
        disabled={!canBook}
        className="mt-5 w-full justify-center"
        arrow
      >
        Check availability
      </Button>

      <p className="mt-4 text-center text-xs text-muted">
        You won&apos;t be charged yet
      </p>
    </div>
  )
}
