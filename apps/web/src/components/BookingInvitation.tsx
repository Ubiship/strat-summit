import { Button } from '@/components/Button'
import { CtaPanel } from '@/components/CtaPanel'

export function BookingInvitation() {
  return (
    <CtaPanel
      title="Your mountain getaway starts here."
      actions={
        <Button href="/stays" size="lg" arrow>
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
