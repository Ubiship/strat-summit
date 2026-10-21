import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

// band: full-width green section. light: white section with green type.
// card: white section holding a contained green panel.
export type InvitationVariant = 'band' | 'light' | 'card'

export function BookingInvitation({
  variant = 'band',
}: {
  variant?: InvitationVariant
}) {
  let onGreen = variant !== 'light'

  let content = (
    <FadeIn className="mx-auto max-w-3xl text-center">
      <h2
        className={clsx(
          'type-display text-[clamp(2.5rem,5vw,3.75rem)]',
          onGreen ? 'text-warm-cream' : 'text-forest-warm',
        )}
      >
        Your mountain getaway starts here.
      </h2>
      <p
        className={clsx(
          'mx-auto mt-8 max-w-[44ch] text-[1.1875rem]/[1.65]',
          onGreen ? 'text-warm-cream/85' : 'text-warm-muted',
        )}
      >
        Find your Mount Washington stay and start planning your next adventure.
      </p>
      <div className="mt-12">
        <Button
          href="/stays"
          tone={variant === 'light' ? 'forest' : 'sun'}
          size="lg"
          arrow
        >
          Check availability
        </Button>
      </div>
    </FadeIn>
  )

  if (variant === 'card') {
    return (
      <Band tone="white">
        <Container>
          <div className="rounded-[3rem] bg-forest-warm px-6 py-20 split:px-12 split:py-24">
            {content}
          </div>
        </Container>
      </Band>
    )
  }

  return (
    <Band tone={variant === 'light' ? 'white' : 'forest'}>
      <Container>{content}</Container>
    </Band>
  )
}
