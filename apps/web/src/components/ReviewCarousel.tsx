import { Band } from '@/components/Band'
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
    <Band tone="forest" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-36 size-[32.5rem] rounded-full sun-glow"
      />
      <Container className="relative">
        <SectionHead
          tone="dark"
          kicker="Guest reviews"
          title="What our guests are saying."
        >
          <p>
            Real experiences from guests who&apos;ve stayed at our Mount
            Washington properties.
          </p>
        </SectionHead>

        <div className="mt-16 overflow-x-auto pb-8 -mx-6 px-6 split:-mx-12 split:px-12">
          <div className="flex gap-6 min-w-min split:gap-8">
            {featuredReviews.map((review) => (
              <FadeIn
                key={review.id}
                className="flex w-[min(28rem,85vw)] flex-none flex-col rounded-[2.5rem] bg-warm-cream/8 p-8 split:p-10"
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
                <blockquote className="mt-8 flex-auto text-[1.0625rem]/[1.7] text-warm-cream/95">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>
                <div className="mt-8 border-t border-warm-cream/10 pt-6">
                  <p className="font-bold text-warm-cream">
                    {review.guestName}
                  </p>
                  <p className="mt-1.5 text-sm text-warm-cream/50">
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
      </Container>
    </Band>
  )
}
