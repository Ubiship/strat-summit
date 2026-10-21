'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { Button } from '@/components/Button'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
    <div className="overflow-hidden rounded-[2.75rem] bg-white p-6 shadow-[0_12px_32px_rgb(42_24_10/0.12)] sm:p-8">
      <div className="grid gap-4 sm:gap-5 split:grid-cols-[1fr_1fr_auto_auto]">
        <div className="min-w-0">
          <label htmlFor="check-in" className={labelClasses}>
            Check-in
          </label>
          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={clsx(inputClasses, 'mt-1.5 w-full min-w-0')}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="check-out" className={labelClasses}>
            Check-out
          </label>
          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
            className={clsx(inputClasses, 'mt-1.5 w-full min-w-0')}
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="guests" className={labelClasses}>
            Guests
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={clsx(inputClasses, 'mt-1.5 w-full min-w-0')}
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
