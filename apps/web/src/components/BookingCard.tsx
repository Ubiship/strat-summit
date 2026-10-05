'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import { buildCheckoutUrl, type HostawayPriceQuote } from '@/lib/hostaway'

type BookingCardProps = {
  listingId: string
  basePrice: number
  maxGuests: number
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function BookingCard({
  listingId,
  basePrice,
  maxGuests,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
}: BookingCardProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn || '')
  const [checkOut, setCheckOut] = useState(initialCheckOut || '')
  const [guests, setGuests] = useState(initialGuests)
  const [pricing, setPricing] = useState<HostawayPriceQuote | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)

  // Fetch pricing when dates and guests are set
  useEffect(() => {
    if (checkIn && checkOut && guests > 0) {
      setLoadingPricing(true)

      // Call API route instead of server function
      const params = new URLSearchParams({
        listingId,
        checkIn,
        checkOut,
        guests: guests.toString(),
      })

      fetch(`/api/pricing?${params.toString()}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch pricing: ${response.status}`)
          }
          return response.json()
        })
        .then((quote: HostawayPriceQuote) => {
          setPricing(quote)
        })
        .catch((error) => {
          console.error('Failed to fetch pricing:', error)
          setPricing(null)
        })
        .finally(() => {
          setLoadingPricing(false)
        })
    } else {
      setPricing(null)
    }
  }, [checkIn, checkOut, guests, listingId])

  const canBook = checkIn && checkOut && guests > 0 && !loadingPricing

  const handleBookNow = () => {
    if (!canBook) return

    const url = buildCheckoutUrl(listingId, checkIn, checkOut, guests)
    window.location.href = url
  }

  // Calculate number of nights
  const calculateNights = (): number => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()

  // Get minimum date for check-in (today)
  const today = new Date().toISOString().split('T')[0]

  // Get minimum date for check-out (day after check-in)
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : today

  return (
    <div className="rounded-[2.75rem] bg-white p-6 shadow-[0_8px_24px_rgb(42_24_10/0.08)] split:sticky split:top-24">
      <div className="mb-6">
        <p className="text-sm font-semibold text-warm-ink/60">From</p>
        <p className="type-display text-[clamp(1.75rem,3vw,2rem)] text-warm-ink">
          ${basePrice.toFixed(0)}
          <span className="text-xl font-medium">/night</span>
        </p>
      </div>

      {/* Date inputs */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
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
            className="w-full rounded-2xl border-2 border-warm-ink/10 bg-warm-cream/50 px-4 py-3 text-sm font-medium text-warm-ink transition focus:border-forest-warm focus:outline-none"
          />
        </div>
        <div>
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
            className="w-full rounded-2xl border-2 border-warm-ink/10 bg-warm-cream/50 px-4 py-3 text-sm font-medium text-warm-ink transition focus:border-forest-warm focus:outline-none"
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

      {/* Price breakdown */}
      {pricing && nights > 0 && (
        <div className="mb-6 space-y-2 border-t-2 border-warm-ink/10 pt-4">
          <div className="flex justify-between text-sm text-warm-ink/70">
            <span>
              ${pricing.nightly.toFixed(0)} × {nights}{' '}
              {nights === 1 ? 'night' : 'nights'}
            </span>
            <span>${(pricing.nightly * nights).toFixed(2)}</span>
          </div>
          {pricing.cleaning > 0 && (
            <div className="flex justify-between text-sm text-warm-ink/70">
              <span>Cleaning fee</span>
              <span>${pricing.cleaning.toFixed(2)}</span>
            </div>
          )}
          {pricing.service > 0 && (
            <div className="flex justify-between text-sm text-warm-ink/70">
              <span>Service fee</span>
              <span>${pricing.service.toFixed(2)}</span>
            </div>
          )}
          {pricing.tax > 0 && (
            <div className="flex justify-between text-sm text-warm-ink/70">
              <span>Taxes</span>
              <span>${pricing.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-warm-ink/10 pt-2 text-base font-bold text-warm-ink">
            <span>Total</span>
            <span>${pricing.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loadingPricing && (
        <div className="mb-6 text-center text-sm text-warm-ink/60">
          Loading pricing...
        </div>
      )}

      {/* Book now button */}
      <Button
        onClick={handleBookNow}
        disabled={!canBook}
        tone="forest"
        size="md"
        className="w-full justify-center"
        arrow
      >
        {pricing ? 'Book Now' : 'Check Availability'}
      </Button>

      <p className="mt-4 text-center text-xs text-warm-ink/60">
        You won't be charged yet
      </p>
    </div>
  )
}
