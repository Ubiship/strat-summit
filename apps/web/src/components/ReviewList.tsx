'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import type { HostawayReview } from '@/lib/hostaway'

type ReviewListProps = {
  reviews: HostawayReview[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [showAll, setShowAll] = useState(false)

  if (reviews.length === 0) {
    return (
      <div className="rounded-[2.75rem] bg-warm-cream/50 p-8 text-center">
        <p className="text-lg text-warm-ink/60">No reviews yet</p>
      </div>
    )
  }

  // Show first 3 reviews by default
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3)

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 text-sun">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={clsx(i < rating ? 'opacity-100' : 'opacity-20')}>
            ★
          </span>
        ))}
      </div>
    )
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div>
      <div className="mb-8 flex items-baseline gap-4">
        <h3 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
          Reviews
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-sun">★</span>
            <span className="text-lg font-bold text-warm-ink">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-base text-warm-ink/60">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {visibleReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[2.75rem] bg-warm-cream/50 p-6"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-warm-ink">{review.guestName}</p>
                <p className="text-sm text-warm-ink/60">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-base/[1.6] text-warm-ink/80">{review.comment}</p>
          </article>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            tone="cream"
            size="sm"
          >
            {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
          </Button>
        </div>
      )}
    </div>
  )
}
