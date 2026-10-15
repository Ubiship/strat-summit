'use client'

import { Button } from '@/components/Button'

type MobileBookingCTAProps = {
  basePrice: number
  bookingCardId?: string
}

export function MobileBookingCTA({ basePrice, bookingCardId = 'booking-card' }: MobileBookingCTAProps) {
  const scrollToBooking = () => {
    const bookingCard = document.getElementById(bookingCardId)
    if (bookingCard) {
      bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-warm-ink/10 bg-white p-4 shadow-[0_-4px_20px_rgb(42_24_10/0.1)] split:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-warm-ink/60">From</p>
          <p className="type-display text-xl text-warm-ink">
            ${basePrice.toFixed(0)}
            <span className="text-base font-medium text-warm-ink/70">/night</span>
          </p>
        </div>
        <Button onClick={scrollToBooking} tone="forest" size="sm">
          Book Now
        </Button>
      </div>
    </div>
  )
}
