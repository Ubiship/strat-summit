'use client'

import { Button } from '@/components/Button'

// Phones only: keeps the booking step one tap away while reading the page.
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur split:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">Choose your dates to book</p>
        <Button onClick={scrollToBooking} size="sm">
          Check availability
        </Button>
      </div>
    </div>
  )
}
