import { Button } from '@/components/Button'

// No prices are shown on the site; guests see the full quote on Hostaway.
export function BookingCard({ bookingUrl }: { bookingUrl: string }) {
  return (
    <div className="overflow-hidden rounded-[2.75rem] bg-white p-8 ring-1 ring-warm-ink/8 shadow-[0_12px_40px_rgb(22_56_38/0.06)] split:sticky split:top-28">
      <div className="mb-6">
        <h2 className="type-display text-[clamp(1.75rem,3vw,2rem)] text-warm-ink">
          Book your stay
        </h2>
        <p className="mt-1 text-sm text-warm-ink/60">
          See live availability and book on our secure booking site.
        </p>
      </div>

      <Button
        href={bookingUrl}
        tone="forest"
        size="md"
        className="w-full justify-center"
        arrow
      >
        Book Now
      </Button>
    </div>
  )
}
