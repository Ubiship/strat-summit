import clsx from 'clsx'

import { Band } from '@/components/Band'
import { cardClasses } from '@/components/Card'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { getReviews } from '@/lib/hostaway'

export async function ReviewCarousel() {
  const reviews = await getReviews()
  // Show only 5-star reviews, up to 6
  const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 6)

  if (featuredReviews.length === 0) {
    return null
  }

  return (
    <Band className="overflow-hidden">
      <Container>
        <SectionHead
          kicker="Guest reviews"
          title="What our guests are saying."
          layout="split"
        >
          <p>
            Real experiences from guests who&apos;ve stayed at our Mount
            Washington properties.
          </p>
        </SectionHead>
      </Container>

      {/* Runs to the viewport edge; the padding lines the first card up with
          the container. */}
      <div className="mt-14 snap-x snap-mandatory scroll-px-[max(1.5rem,calc((100%-78rem)/2+1.5rem))] overflow-x-auto px-[max(1.5rem,calc((100%-78rem)/2+1.5rem))] pb-8 [scrollbar-width:thin] split:mt-16 split:scroll-px-[max(3rem,calc((100%-78rem)/2+3rem))] split:px-[max(3rem,calc((100%-78rem)/2+3rem))]">
        <div className="flex min-w-min gap-6 split:gap-8">
          {featuredReviews.map((review) => (
            <FadeIn
              key={review.id}
              className={clsx(
                cardClasses({ tone: 'tint' }),
                'flex w-[min(28rem,85vw)] flex-none snap-start flex-col p-8 split:p-10',
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
              <blockquote className="mt-8 flex-auto text-[1.0625rem]/[1.7] text-warm-ink">
                &ldquo;{review.comment}&rdquo;
              </blockquote>
              <div className="mt-8 border-t border-forest-warm/10 pt-6">
                <p className="font-bold text-forest-warm">
                  {review.guestName}
                </p>
                <p className="mt-1.5 text-sm text-warm-muted">
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
    </Band>
  )
}
