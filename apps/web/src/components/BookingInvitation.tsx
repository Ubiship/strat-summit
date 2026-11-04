import { Button } from '@/components/Button'
import { CtaPanel } from '@/components/CtaPanel'
import { getBookingSiteUrl } from '@/lib/booking'

export function BookingInvitation() {
  return (
    <CtaPanel
      title="Your mountain getaway starts here."
      actions={
        <Button href={getBookingSiteUrl()} size="lg" arrow>
          Check availability
        </Button>
      }
    >
      <p>
        Find your Mount Washington stay and start planning your next adventure.
      </p>
    </CtaPanel>
  )
}
