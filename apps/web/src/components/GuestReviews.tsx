import {
  ReviewsWithHoverAndTextAnimation,
  type ReviewItem,
} from '@/components/ui/reviews-with-hover-and-text-animation'
import { getReviews } from '@/lib/hostaway'

// The opening sentence is set as the review's lead; the rest follows in a
// lighter tone, as in the block this section is adapted from.
function splitLead(comment: string) {
  let match = comment.match(/^(.+?[.!?])\s+([\s\S]+)$/)
  return match
    ? { lead: match[1], rest: match[2] }
    : { lead: comment, rest: '' }
}

export async function GuestReviews() {
  const reviews = await getReviews()
  const featuredReviews = reviews.slice(0, 6)

  if (featuredReviews.length === 0) {
    return null
  }

  // Dates are formatted here so server and client render the same string.
  let items: ReviewItem[] = featuredReviews.map((review) => ({
    id: review.id,
    guestName: review.guestName,
    rating: review.rating,
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }),
    ...splitLead(review.comment),
  }))

  return (
    <ReviewsWithHoverAndTextAnimation
      kicker="Guest reviews"
      intro="Real experiences from guests at our Mount Washington properties."
      reviews={items}
    />
  )
}
