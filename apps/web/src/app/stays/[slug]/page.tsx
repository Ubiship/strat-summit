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
import { ReviewList } from '@/components/ReviewList'
import {
  getProperty,
  getAvailability,
  getReviews,
} from '@/lib/hostaway'

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

  return (
    <RootLayout>
      <Band tone="cream">
        <Container className="py-16">
          <FadeIn>
            <PhotoGallery photos={property.photos} propertyName={property.name} />
          </FadeIn>

          <div className="mt-12 grid gap-12 split:grid-cols-[1fr,400px]">
            {/* Left column - Property details */}
            <FadeInStagger>
              {/* Property header */}
              <FadeIn>
                <h1 className="type-display text-[clamp(2rem,4vw,3rem)] text-warm-ink">
                  {property.name}
                </h1>
                <p className="mt-2 text-lg text-warm-ink/70">Mount Washington, Vancouver Island</p>

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

                <div className="mt-6 flex flex-wrap gap-3 text-base font-semibold text-warm-ink/80">
                  <span className="rounded-full bg-sand px-4 py-2.5">
                    {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                  </span>
                  <span className="rounded-full bg-sand px-4 py-2.5">
                    {property.bathrooms}{' '}
                    {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
                  </span>
                  <span className="rounded-full bg-sand px-4 py-2.5">
                    Sleeps {property.maxGuests}
                  </span>
                </div>
              </FadeIn>

              {/* Description */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  About this property
                </h2>
                <p className="mt-4 whitespace-pre-line text-base/[1.7] text-warm-ink/80">
                  {property.description}
                </p>
              </FadeIn>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
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
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <AvailabilityCalendar
                  listingId={property.id.toString()}
                  initialAvailability={availability}
                />
              </FadeIn>

              {/* Location */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  Location
                </h2>
                <p className="mt-4 text-base text-warm-ink/80">
                  Mount Washington, Vancouver Island, BC
                </p>
                <p className="mt-2 text-sm text-warm-ink/60">
                  Exact address provided after booking confirmation
                </p>
                {/* Future task: Add map integration */}
                <div className="mt-6 grid aspect-[16/9] place-items-center rounded-[2.75rem] bg-sand">
                  <p className="text-lg text-warm-ink/40">Map coming soon</p>
                </div>
              </FadeIn>

              {/* Reviews */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <ReviewList reviews={reviews} />
              </FadeIn>

              {/* House Rules */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
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
                    Pet friendly: {property.amenities?.some(a =>
                      a.toLowerCase().includes('pet') || a.toLowerCase().includes('dog')
                    ) ? 'Yes' : 'No'}
                  </li>
                </ul>
              </FadeIn>

              {/* Cancellation Policy */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <h2 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink">
                  Cancellation policy
                </h2>
                <p className="mt-4 text-base/[1.7] text-warm-ink/80">
                  Cancellation policies vary by property and booking dates. Please
                  review the specific cancellation terms during checkout or contact
                  us for details.
                </p>
              </FadeIn>

              {/* Bottom Book Now CTA */}
              <FadeIn className="border-t-2 border-warm-ink/10 pt-8">
                <div className="rounded-[2.75rem] bg-forest-warm/5 p-8 text-center">
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
                  basePrice={property.basePrice}
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
      <MobileBookingCTA basePrice={property.basePrice} />
    </RootLayout>
  )
}
