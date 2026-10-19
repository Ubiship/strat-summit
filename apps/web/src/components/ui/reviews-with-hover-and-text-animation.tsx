'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Kicker } from '@/components/Kicker'
import { cn } from '@/lib/utils'

// Adapted from Aceternity's "features with hover and text animation" block:
// hovering a review swaps the guest's name into the headline.
export type ReviewItem = {
  id: number
  guestName: string
  rating: number
  lead: string
  rest: string
  date: string
}

const FALLBACK_NAME = 'you'

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-highlight"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < rating ? undefined : 'opacity-25'}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function ReviewsWithHoverAndTextAnimation({
  kicker,
  intro,
  reviews,
}: {
  kicker: string
  intro: string
  reviews: ReviewItem[]
}) {
  let [hovered, setHovered] = useState<ReviewItem | null>(null)

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-[75rem] px-6 py-24 split:py-36">
        <Kicker>{kicker}</Kicker>
        <h2 className="mt-4 max-w-5xl type-display text-[clamp(2.5rem,5vw,4rem)] text-ink perspective-distant">
          Loved by guests like{' '}
          <AnimatePresence mode="popLayout">
            <motion.span
              key={hovered?.guestName ?? FALLBACK_NAME}
              initial={{ y: -20, opacity: 0, rotateX: 40 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: 10, opacity: 0, rotateX: -40 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(
                'inline-block whitespace-nowrap',
                hovered ? 'text-accent' : 'text-ink',
              )}
            >
              {hovered?.guestName ?? FALLBACK_NAME}
            </motion.span>
            .
          </AnimatePresence>
        </h2>
        <p className="mt-6 max-w-[52ch] text-[1.1875rem]/[1.55] text-muted">
          {intro}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line split:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.id}
              onMouseEnter={() => setHovered(review)}
              onMouseLeave={() => setHovered(null)}
              className="group relative flex flex-col items-start justify-between gap-10 bg-white p-6 transition-shadow duration-200 hover:z-10 hover:shadow-[0_18px_40px_rgb(20_28_34/0.08)] md:p-8"
            >
              <blockquote className="text-base/[1.65] text-muted">
                <span
                  className={cn(
                    'font-medium transition-colors duration-200',
                    hovered?.id === review.id ? 'text-accent' : 'text-ink',
                  )}
                >
                  {review.lead}
                </span>
                {review.rest && <> {review.rest}</>}
              </blockquote>
              <figcaption className="flex w-full items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {review.guestName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{review.date}</p>
                </div>
                <Stars rating={review.rating} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
