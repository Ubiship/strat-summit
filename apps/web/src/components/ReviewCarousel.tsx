import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { getReviews } from '@/lib/hostaway'

// band: full-width green section. light: white section with tinted cards.
// card: white section holding a contained green panel.
export async function ReviewCarousel({
  variant = 'band',
}: {
  variant?: 'band' | 'light' | 'card'
}) {
  const reviews = await getReviews()
  // Show only 5-star reviews, up to 6
  const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 6)

  if (featuredReviews.length === 0) {
    return null
  }

  let onGreen = variant !== 'light'

  let content = (
    <>
      <SectionHead
        tone={onGreen ? 'dark' : 'light'}
        kicker="Guest reviews"
        title="What our guests are saying."
      >
        <p>
          Real experiences from guests who&apos;ve stayed at our Mount
          Washington properties.
        </p>
      </SectionHead>

      <div className="-mx-6 mt-16 overflow-x-auto px-6 pb-8 split:-mx-12 split:px-12">
        <div className="flex min-w-min gap-6 split:gap-8">
          {featuredReviews.map((review) => (
            <FadeIn
              key={review.id}
              className={clsx(
                'flex w-[min(28rem,85vw)] flex-none flex-col rounded-[2.5rem] p-8 split:p-10',
                onGreen ? 'bg-warm-cream/8' : 'bg-sand',
              )}
            >
              <div className="flex items-center gap-2 text-lg text-sun">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < review.rating ? 'opacity-100' : 'opacity-30'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <blockquote
                className={clsx(
                  'mt-8 flex-auto text-[1.0625rem]/[1.7]',
                  onGreen ? 'text-warm-cream/95' : 'text-warm-ink',
                )}
              >
                &ldquo;{review.comment}&rdquo;
              </blockquote>
              <div
                className={clsx(
                  'mt-8 border-t pt-6',
                  onGreen ? 'border-warm-cream/10' : 'border-forest-warm/10',
                )}
              >
                <p
                  className={clsx(
                    'font-bold',
                    onGreen ? 'text-warm-cream' : 'text-forest-warm',
                  )}
                >
                  {review.guestName}
                </p>
                <p
                  className={clsx(
                    'mt-1.5 text-sm',
                    onGreen ? 'text-warm-cream/50' : 'text-warm-muted',
                  )}
                >
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  )

  if (variant === 'card') {
    return (
      <Band tone="white">
        <Container>
          <div className="relative overflow-hidden rounded-[3rem] bg-forest-warm px-6 pt-16 pb-8 text-warm-cream split:px-12 split:pt-20">
            {content}
          </div>
        </Container>
      </Band>
    )
  }

  return (
    <Band
      tone={variant === 'light' ? 'white' : 'forest'}
      className="overflow-hidden"
    >
      {variant === 'band' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-36 size-[32.5rem] rounded-full sun-glow"
        />
      )}
      <Container className="relative">{content}</Container>
    </Band>
  )
}
