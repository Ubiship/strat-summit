import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { RootLayout } from '@/components/RootLayout'
import { PhotoGallery } from '@/components/PhotoGallery'
import { BookingCard } from '@/components/BookingCard'
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

const houseRules = [
  'Check-in: 4:00 PM - 8:00 PM',
  'Check-out: 11:00 AM',
  'No smoking',
  'No parties or events',
]

function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <FadeIn className="border-t border-line py-12">
      <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-5">{children}</div>
    </FadeIn>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul role="list" className="grid gap-3 text-base text-ink split:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-2.5 size-1 flex-none rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  )
}

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
      <Container className="pt-10 pb-24 split:pt-14 split:pb-36">
        <FadeIn>
          <PhotoGallery photos={property.photos} propertyName={property.name} />
        </FadeIn>

        <div className="mt-12 grid gap-12 split:mt-16 split:grid-cols-[1fr_22rem] split:gap-20">
          {/* Left column - Property details */}
          <FadeInStagger>
            <FadeIn className="pb-12">
              <PropertyTypeLabel type={highlights.type} className="mb-4" />
              <h1 className="type-display text-[clamp(2.25rem,4.5vw,3.25rem)]">
                {property.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted">
                <span>{property.address}</span>
                {averageRating && (
                  <span className="flex items-center gap-1 text-ink">
                    <span aria-hidden="true" className="text-highlight">
                      ★
                    </span>
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    {reviews.length > 0 && (
                      <span className="text-muted">
                        ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <PropertyHighlights
                highlights={highlights}
                size="lg"
                className="mt-8 rounded-[1.25rem] border border-line px-6 py-5"
              />
            </FadeIn>

            <DetailSection title="About this property">
              <p className="text-base/[1.75] whitespace-pre-line text-ink/85">
                {property.description}
              </p>
            </DetailSection>

            {property.amenities && property.amenities.length > 0 && (
              <DetailSection title="Amenities">
                <BulletList items={property.amenities} />
              </DetailSection>
            )}

            <FadeIn className="border-t border-line py-12">
              <AvailabilityCalendar
                listingId={property.id.toString()}
                initialAvailability={availability}
              />
            </FadeIn>

            <DetailSection title="Location">
              <p className="text-base text-ink/85">{property.address}</p>
              {/* Future task: Add map integration */}
              <div className="mt-6 grid aspect-[16/9] place-items-center rounded-[1.5rem] bg-mist">
                <p className="text-base text-muted">Map coming soon</p>
              </div>
            </DetailSection>

            <FadeIn className="border-t border-line py-12">
              <ReviewList reviews={reviews} />
            </FadeIn>

            <DetailSection title="House rules">
              <BulletList
                items={[
                  ...houseRules,
                  highlights.petFriendly
                    ? 'Pets welcome'
                    : 'Pets may be allowed (check with host)',
                ]}
              />
            </DetailSection>

            <DetailSection title="Cancellation policy">
              <div className="max-w-[62ch] space-y-4 text-base/[1.7] text-ink/85">
                <p>
                  We have a 30-day cancellation policy on all bookings.
                  Cancellations made at least 30 days before your arrival date
                  receive a full refund. Cancellations made fewer than 30 days
                  but at least 7 days before your arrival date receive a 50%
                  refund. Cancellations made fewer than 7 days before your
                  arrival date receive no refund.
                </p>
              </div>

              <div className="mt-8 max-w-[62ch] rounded-[1.25rem] bg-mist p-6">
                <h3 className="text-base font-semibold">
                  Winter Conditions and Cancellation
                </h3>
                <div className="mt-3 space-y-4 text-[0.9375rem]/[1.7] text-ink/85">
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
            </DetailSection>
          </FadeInStagger>

          {/* Right column - Booking card (sticky on desktop) */}
          <div>
            <BookingCard
              listingId={property.id.toString()}
              maxGuests={property.maxGuests}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialGuests={guests}
            />
          </div>
        </div>
      </Container>
    </RootLayout>
  )
}
