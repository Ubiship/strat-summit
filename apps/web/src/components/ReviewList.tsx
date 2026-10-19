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
      <div className="rounded-[1.5rem] border border-line p-8 text-center">
        <p className="text-lg text-muted">No reviews yet</p>
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
      <div className="flex gap-1 text-highlight">
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
        <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">
          Reviews
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xl text-highlight">★</span>
            <span className="text-lg font-semibold">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-base text-muted">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {visibleReviews.map((review) => (
          <article
            key={review.id}
            className="border-t border-line pt-6"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{review.guestName}</p>
                <p className="text-sm text-muted">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-base/[1.65] text-ink">{review.comment}</p>
          </article>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            tone="outline"
            size="sm"
          >
            {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
          </Button>
        </div>
      )}
    </div>
  )
}
