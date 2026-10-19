import { type Metadata } from 'next'
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertyFilters } from '@/components/PropertyFilters'
import { RootLayout } from '@/components/RootLayout'
import { SearchBar } from '@/components/SearchBar'
import {
  ExpandablePropertyCards,
  type ExpandableProperty,
} from '@/components/ui/expandable-property-cards'
import { getPropertyHighlights } from '@/lib/propertyHighlights'
import { site } from '@/lib/site'
import {
  getProperties,
  getAvailability,
  type HostawayProperty,
} from '@/lib/hostaway'

export const metadata: Metadata = {
  title: 'Find Your Stay',
  description:
    'Browse our collection of vacation rentals on Vancouver Island. Comfortable, well-maintained properties in beautiful locations.',
}

type SearchParams = Promise<{
  checkIn?: string
  checkOut?: string
  guests?: string
  bedrooms?: string
  amenities?: string
}>

// Cache property list for 1 hour
const getCachedProperties = unstable_cache(
  async () => {
    return await getProperties()
  },
  ['properties-list'],
  { revalidate: 3600 },
)

async function filterProperties(
  properties: HostawayProperty[],
  filters: Awaited<SearchParams>,
) {
  let filtered = properties

  // Filter by bedrooms
  if (filters.bedrooms) {
    const minBedrooms = parseInt(filters.bedrooms)
    filtered = filtered.filter((p) => p.bedrooms >= minBedrooms)
  }

  // Filter by amenities
  if (filters.amenities) {
    const requiredAmenities = filters.amenities.split(',')
    filtered = filtered.filter((p) =>
      requiredAmenities.every((amenity) => p.amenities?.includes(amenity)),
    )
  }

  // If dates provided, keep only properties available for every night
  if (filters.checkIn && filters.checkOut) {
    const available = await Promise.all(
      filtered.map(async (property) => {
        try {
          const availability = await getAvailability(
            property.id.toString(),
            filters.checkIn!,
            filters.checkOut!,
          )
          return availability.every((day) => day.available) ? property : null
        } catch (error) {
          // Log error but don't fail the entire request; still show the property
          console.error(
            `Error fetching availability for property ${property.id}:`,
            error,
          )
          return property
        }
      }),
    )

    return available.filter((p) => p !== null)
  }

  return filtered
}

export default async function StaysPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const allProperties = await getCachedProperties()
  const properties = await filterProperties(allProperties, searchParams)

  const hasSearchParams =
    searchParams.checkIn || searchParams.checkOut || searchParams.guests

  // Carry the guest's dates and party size through to the property page.
  const detailParams = new URLSearchParams()
  if (searchParams.checkIn) detailParams.set('checkIn', searchParams.checkIn)
  if (searchParams.checkOut) detailParams.set('checkOut', searchParams.checkOut)
  if (searchParams.guests) detailParams.set('guests', searchParams.guests)
  const detailQuery = detailParams.toString()

  // Only plain data crosses into the client component.
  const cards: ExpandableProperty[] = properties.map((property) => {
    const cover = property.photos.find((p) => p.isCover) || property.photos[0]
    return {
      id: property.id,
      name: property.name,
      address: property.address,
      description: property.description,
      href: `/stays/${property.id}${detailQuery ? `?${detailQuery}` : ''}`,
      rating: property.rating,
      reviewCount: property.reviewCount,
      highlights: getPropertyHighlights(property),
      image: cover && { src: cover.url, alt: cover.caption || property.name },
    }
  })

  return (
    <RootLayout>
      <PageHero
        kicker="Vacation rentals"
        title="Find your perfect stay on Vancouver Island."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
      >
        <p>
          Browse our collection of well-maintained properties in beautiful
          locations. Each rental is professionally cleaned and ready to welcome
          you.
        </p>
      </PageHero>

      {/* Search and filters: a calm toolbar directly under the hero. */}
      <section
        aria-label="Search and filter stays"
        className="bg-white pt-16 split:pt-20"
      >
        <Container>
          <FadeIn>
            <Suspense fallback={<div className="h-[4.75rem]" />}>
              <SearchBar />
            </Suspense>
          </FadeIn>

          <FadeIn className="mt-10 border-t border-line pt-8 split:mt-12 split:pt-10">
            <Suspense fallback={<div className="h-[5.5rem]" />}>
              <PropertyFilters />
            </Suspense>
          </FadeIn>
        </Container>
      </section>

      <Band tone="white" className="pt-12! split:pt-14!">
        <Container>
          <FadeIn className="border-t border-line pt-8 split:pt-10">
            <p className="text-[0.9375rem] font-medium text-muted">
              <span className="font-semibold text-ink">
                {properties.length}
              </span>{' '}
              {properties.length === 1 ? 'property' : 'properties'}{' '}
              {hasSearchParams ? 'available' : 'in our collection'}
            </p>
          </FadeIn>

          {properties.length === 0 ? (
            <FadeIn className="mx-auto mt-16 max-w-xl text-center split:mt-20">
              <p className="type-display text-[clamp(1.75rem,3vw,2.5rem)] text-balance text-ink">
                {hasSearchParams
                  ? 'No properties match your search criteria.'
                  : 'No properties available at this time.'}
              </p>
              <p className="mt-4 text-[1.1875rem]/[1.55] text-muted">
                {hasSearchParams
                  ? 'Try adjusting your dates, guest count, or filters.'
                  : 'Please check back soon.'}
              </p>
            </FadeIn>
          ) : (
            <ExpandablePropertyCards properties={cards} />
          )}
        </Container>
      </Band>
    </RootLayout>
  )
}
