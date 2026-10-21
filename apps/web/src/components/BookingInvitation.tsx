import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export function BookingInvitation() {
  return (
    <Band>
      <Container>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="type-display text-[clamp(2.5rem,5vw,3.75rem)] text-forest-warm">
            Your mountain getaway starts here.
          </h2>
          <p className="mx-auto mt-8 max-w-[44ch] text-[1.1875rem]/[1.65] text-warm-muted">
            Find your Mount Washington stay and start planning your next
            adventure.
          </p>
          <div className="mt-12">
            <Button href="/stays" size="lg" arrow>
              Check availability
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Band>
  )
}
