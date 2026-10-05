import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { getReviews } from '@/lib/hostaway'

export async function ReviewCarousel() {
  const reviews = await getReviews()
  const featuredReviews = reviews.slice(0, 6)

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
          title="Hear from our guests."
        >
          <p>
            Discover why travelers choose to book with us again and again. Real
            experiences from real guests at our Mount Washington properties.
          </p>
        </SectionHead>

        <div className="mt-12 overflow-x-auto pb-6 -mx-4 px-4">
          <div className="flex gap-6 min-w-min">
            {featuredReviews.map((review) => (
              <FadeIn
                key={review.id}
                className="flex w-[min(26rem,85vw)] flex-none flex-col rounded-[2.5rem] bg-warm-cream/8 p-8"
              >
                <div className="flex items-center gap-1.5 text-sun">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < review.rating ? 'opacity-100' : 'opacity-30'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <blockquote className="mt-6 flex-auto text-base/[1.6] text-warm-cream/95">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>
                <p className="mt-6 font-bold text-warm-cream">
                  {review.guestName}
                </p>
                <p className="mt-1 text-sm text-warm-cream/60">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </Band>
  )
}
