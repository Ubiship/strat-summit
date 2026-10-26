'use client'

import { Button } from '@/components/Button'

// No price is shown; guests see the full quote at checkout.
export function MobileBookingCTA({
  bookingCardId = 'booking-card',
}: {
  bookingCardId?: string
}) {
  const scrollToBooking = () => {
    const bookingCard = document.getElementById(bookingCardId)
    if (bookingCard) {
      bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-warm-ink/10 bg-white p-4 shadow-[0_-4px_20px_rgb(22_56_38/0.1)] split:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-warm-ink/60">Choose your dates to book</p>
        <Button onClick={scrollToBooking} tone="forest" size="sm">
          Check Availability
        </Button>
      </div>
    </div>
  )
}
