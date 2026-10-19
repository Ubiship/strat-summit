'use client'

import { useId, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

import { Button } from '@/components/Button'

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const checkInId = useId()
  const checkOutId = useId()
  const guestsId = useId()

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(searchParams.get('guests') || '2')

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)

    router.push(`/stays?${params.toString()}`)
  }

  const fieldClasses =
    'flex min-w-0 flex-col rounded-xl px-4 py-2.5 transition focus-within:bg-mist hover:bg-mist'
  const labelClasses = 'text-xs font-semibold text-ink'
  const inputClasses =
    'mt-0.5 w-full min-w-0 bg-transparent text-[0.9375rem] text-muted focus:outline-none'

  return (
    <form
      onSubmit={handleSearch}
      className={clsx(
        'grid gap-1 rounded-[1.5rem] border border-line bg-white p-2 text-left shadow-[0_10px_30px_rgb(20_28_34/0.06)] split:grid-cols-[1fr_1fr_1fr_auto] split:items-center',
        className,
      )}
    >
      <div className={fieldClasses}>
        <label htmlFor={checkInId} className={labelClasses}>
          Check-in
        </label>
        <input
          id={checkInId}
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className={fieldClasses}>
        <label htmlFor={checkOutId} className={labelClasses}>
          Check-out
        </label>
        <input
          id={checkOutId}
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          min={checkIn || undefined}
          className={inputClasses}
        />
      </div>

      <div className={fieldClasses}>
        <label htmlFor={guestsId} className={labelClasses}>
          Guests
        </label>
        <select
          id={guestsId}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className={inputClasses}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="m-1 justify-center">
        Search
      </Button>
    </form>
  )
}
