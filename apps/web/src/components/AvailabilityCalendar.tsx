'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { HostawayCalendarDay } from '@/lib/hostaway'

type AvailabilityCalendarProps = {
  listingId: string
  initialAvailability: HostawayCalendarDay[]
}

export function AvailabilityCalendar({
  listingId,
  initialAvailability,
}: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<HostawayCalendarDay[]>(
    initialAvailability,
  )

  // Generate two months of dates starting from today
  const today = new Date()
  const months = [today, new Date(today.getFullYear(), today.getMonth() + 1, 1)]

  // Create availability lookup map
  const availabilityMap = new Map(
    availability.map((day) => [day.date, day]),
  )

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    // Add padding for first week
    const firstDayOfWeek = firstDay.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(new Date(0)) // Empty slot
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isToday = (date: Date): boolean => {
    return formatDate(date) === formatDate(new Date())
  }

  const isPast = (date: Date): boolean => {
    return date < new Date(new Date().setHours(0, 0, 0, 0))
  }

  return (
    <div>
      <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">
        Availability
      </h2>
      <p className="mt-2 text-base text-muted">
        Dates that are crossed out are unavailable.
      </p>

      <div className="mt-6 grid gap-8 split:grid-cols-2">
        {months.map((month, monthIndex) => {
          const days = getDaysInMonth(month)

          return (
            <div key={monthIndex}>
              <h3 className="mb-4 text-center text-base font-semibold">
                {month.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>

              {/* Weekday headers */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div key={day}>{day}</div>
                  ),
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (date.getTime() === 0) {
                    // Empty slot
                    return <div key={index} />
                  }

                  const dateStr = formatDate(date)
                  const dayInfo = availabilityMap.get(dateStr)
                  const available = dayInfo?.available ?? true
                  const past = isPast(date)
                  const today = isToday(date)

                  return (
                    <div
                      key={index}
                      className={clsx(
                        'grid aspect-square place-items-center rounded-lg text-sm font-medium',
                        {
                          'text-ink': available && !past,
                          'text-ink/25 line-through':
                            !available || past,
                          'ring-1 ring-accent': today && available && !past,
                        },
                      )}
                    >
                      {date.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
