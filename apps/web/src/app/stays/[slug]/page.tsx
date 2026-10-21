import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { RootLayout } from '@/components/RootLayout'
import { PhotoGallery } from '@/components/PhotoGallery'
import { BookingCard } from '@/components/BookingCard'
import { MobileBookingCTA } from '@/components/MobileBookingCTA'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import {
  PropertyHighlights,
  PropertyTypeLabel,
} from '@/components/PropertyHighlights'
import { ReviewList } from '@/components/ReviewList'
import {
  getProperty,
  getAvailability,
  getReviews,
} from '@/lib/hostaway'
import { getPropertyHighlights } from '@/lib/propertyHighlights'
import { site } from '@/lib/site'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}

// Cache reviews with 6-hour revalidation
const getCachedReviews = unstable_cache(
  async (listingId: string) => {
    return await getReviews(listingId)
  },
  ['property-reviews'],
  { revalidate: 21600 }, // 6 hours
)

// Generate metadata for SEO
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const property = await getProperty(params.slug)

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${property.name} - Vacation Rental`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.name,
      description: property.description,
      images: property.photos.length > 0 ? [property.photos[0].url] : [],
    },
  }
}

export default async function PropertyDetailPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams

  // Treat slug as property ID for now (future task will add slug mapping)
  const property = await getProperty(params.slug)

  if (!property) {
    notFound()
  }

  // Fetch reviews (cached)
  const reviews = await getCachedReviews(property.id.toString())

  // Fetch availability for next 2 months
  const today = new Date()
  const twoMonthsLater = new Date(
    today.getFullYear(),
    today.getMonth() + 2,
    today.getDate(),
  )
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }
  const availability = await getAvailability(
    property.id.toString(),
    formatDate(today),
    formatDate(twoMonthsLater),
  )

  // Parse search params for BookingCard
  const checkIn = searchParams.checkIn
  const checkOut = searchParams.checkOut
  const guests = searchParams.guests ? parseInt(searchParams.guests) : 2

  // Calculate average rating from reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : property.rating

  const highlights = getPropertyHighlights(property)

  return (
    <RootLayout>
      <Band tone="white">
        <Container className="pb-8 split:pb-16">
          <FadeIn>
            <PhotoGallery photos={property.photos} propertyName={property.name} />
          </FadeIn>

          <div className="mt-14 grid gap-14 split:mt-20 split:grid-cols-[1fr_380px] split:gap-24">
            {/* Left column - Property details */}
            <FadeInStagger>
              {/* Property header */}
              <FadeIn className="pb-14">
                <PropertyTypeLabel type={highlights.type} className="mb-4" />
                <h1 className="type-display text-[clamp(2rem,4vw,3rem)] text-warm-ink">
                  {property.name}
                </h1>
                <p className="mt-2 text-lg text-warm-ink/70">{site.propertyArea}</p>

                {averageRating && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl text-sun">★</span>
                    <span className="text-lg font-bold text-warm-ink">
                      {averageRating.toFixed(1)}
                    </span>
                    {reviews.length > 0 && (
                      <span className="text-base text-warm-ink/60">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                )}

                <PropertyHighlights
                  highlights={highlights}
                  size="lg"
                  className="mt-6"
                />
              </FadeIn>

              {/* Description */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  About this property
                </h2>
                <p className="mt-4 whitespace-pre-line text-base/[1.7] text-warm-ink/80">
                  {property.description}
                </p>
              </FadeIn>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <FadeIn className="border-t border-warm-ink/10 py-14">
                  <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                    Amenities
                  </h2>
                  <ul className="mt-6 grid gap-3 split:grid-cols-2">
                    {property.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-start gap-3 text-base text-warm-ink/80"
                      >
                        <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              )}

              {/* Availability Calendar */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <AvailabilityCalendar
                  listingId={property.id.toString()}
                  initialAvailability={availability}
                />
              </FadeIn>

              {/* Location */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  Location
                </h2>
                <p className="mt-4 text-base text-warm-ink/80">
                  {site.propertyArea}, BC
                </p>
                <p className="mt-2 text-sm text-warm-ink/60">
                  Exact address provided after booking confirmation
                </p>
                {/* Future task: Add map integration */}
                <div className="mt-6 grid aspect-[16/9] place-items-center rounded-[2.75rem] bg-warm-cream">
                  <p className="text-lg text-warm-ink/40">Map coming soon</p>
                </div>
              </FadeIn>

              {/* Reviews */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <ReviewList reviews={reviews} />
              </FadeIn>

              {/* House Rules */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  House rules
                </h2>
                <ul className="mt-6 space-y-3 text-base text-warm-ink/80">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                    Check-in: 4:00 PM - 8:00 PM
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                    Check-out: 11:00 AM
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                    No smoking
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                    No parties or events
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 flex-shrink-0 rounded-full bg-forest-warm" />
                    Pet friendly: {highlights.petFriendly ? 'Yes' : 'No'}
                  </li>
                </ul>
              </FadeIn>

              {/* Cancellation Policy */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  Cancellation policy
                </h2>
                <p className="mt-4 max-w-[62ch] text-base/[1.7] text-warm-ink/80">
                  We have a 30-day cancellation policy on all bookings.
                  Cancellations made at least 30 days before your arrival date
                  receive a full refund. Cancellations made fewer than 30 days
                  but at least 7 days before your arrival date receive a 50%
                  refund. Cancellations made fewer than 7 days before your
                  arrival date receive no refund.
                </p>

                <div className="mt-8 max-w-[62ch] rounded-[2.75rem] bg-warm-cream p-8">
                  <h3 className="text-lg font-bold text-warm-ink">
                    Winter Conditions and Cancellation
                  </h3>
                  <div className="mt-3 space-y-4 text-base/[1.7] text-warm-ink/80">
                    <p>
                      Our standard cancellation policy applies throughout the
                      winter season. Refunds, credits, or date changes are not
                      provided due to snowfall, snow quality, weather conditions,
                      limited terrain, or partial mountain operations.
                    </p>
                    <p>
                      If Mount Washington Alpine Resort closes all mountain
                      operations specifically due to insufficient snow, we will
                      consider affected reservations for a refund or credit.
                    </p>
                    <p>
                      If any portion of the mountain remains operational,
                      including Nordic, beginner terrain, or limited alpine
                      terrain, the standard cancellation policy remains in
                      effect.
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Bottom Book Now CTA */}
              <FadeIn className="border-t border-warm-ink/10 py-14">
                <div className="rounded-[2.75rem] bg-warm-cream p-10 text-center split:p-14">
                  <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                    Ready to book?
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-base text-warm-ink/70">
                    Select your dates above and secure your stay at {property.name}.
                  </p>
                  <Button
                    href="#booking-card"
                    tone="forest"
                    size="md"
                    className="mt-6"
                    arrow
                  >
                    Check Availability
                  </Button>
                </div>
              </FadeIn>
            </FadeInStagger>

            {/* Right column - Booking card (sticky on desktop) */}
            <FadeIn>
              <div id="booking-card">
                <BookingCard
                  listingId={property.id.toString()}
                  maxGuests={property.maxGuests}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  initialGuests={guests}
                />
              </div>
            </FadeIn>
          </div>
        </Container>
      </Band>

      {/* Mobile sticky booking CTA */}
      <MobileBookingCTA />
    </RootLayout>
  )
}
