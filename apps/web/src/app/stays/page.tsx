import { type Metadata } from 'next'
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { RootLayout } from '@/components/RootLayout'
import { getBookingSiteUrl } from '@/lib/booking'
import { site } from '@/lib/site'
import { getProperties, type HostawayProperty } from '@/lib/hostaway'
import { getPropertyHighlights } from '@/lib/propertyHighlights'

export const metadata: Metadata = {
  title: 'Mount Washington Vacation Rentals',
  description:
    'Browse our collection of vacation rentals on Mount Washington, Vancouver Island. Chalets and condos professionally cleaned and ready to welcome you.',
}

type SearchParams = Promise<{
  bedrooms?: string
  amenities?: string
  propertyType?: string
}>

// Cache property list for 1 hour
const getCachedProperties = unstable_cache(
  async () => {
    return await getProperties()
  },
  ['properties-list'],
  { revalidate: 3600 },
)

function filterProperties(
  properties: HostawayProperty[],
  filters: Awaited<SearchParams>,
) {
  let filtered = properties

  // Filter by bedrooms
  if (filters.bedrooms) {
    const minBedrooms = parseInt(filters.bedrooms)
    filtered = filtered.filter((p) => p.bedrooms >= minBedrooms)
  }

  // Filter by property type, using the same rule as the card labels
  if (filters.propertyType) {
    filtered = filtered.filter(
      (p) => getPropertyHighlights(p).type === filters.propertyType,
    )
  }

  // Filter by amenities. Hot tub and pets go through the highlight detection
  // so listings that say "Jacuzzi" or "Pets allowed" still match.
  if (filters.amenities) {
    const requiredAmenities = filters.amenities.split(',')
    filtered = filtered.filter((p) => {
      let highlights = getPropertyHighlights(p)
      return requiredAmenities.every((amenity) => {
        if (amenity === 'Hot tub') return highlights.hotTub
        if (amenity === 'Pet friendly') return highlights.petFriendly
        return p.amenities?.includes(amenity)
      })
    })
  }

  return filtered
}

export default async function StaysPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const allProperties = await getCachedProperties()
  const properties = filterProperties(allProperties, searchParams)

  const hasFilters =
    searchParams.bedrooms || searchParams.amenities || searchParams.propertyType

  return (
    <RootLayout>
      <PageHero
        title="Mount Washington Vacation Rentals"
        size="short"
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
      />

      <Band>
        <Container>
          <FadeIn className="text-center">
            <Button href={getBookingSiteUrl()} tone="forest" size="lg" arrow>
              Search availability on our booking portal
            </Button>
          </FadeIn>

          <FadeIn className="mt-8">
            <Suspense fallback={<div className="h-[300px]" />}>
              <PropertyFilters />
            </Suspense>
          </FadeIn>

          {properties.length === 0 ? (
            <FadeIn className="mt-16 text-center">
              <p className="type-display text-[clamp(1.5rem,2.5vw,2rem)] text-warm-ink">
                {hasFilters
                  ? 'No properties match your filters.'
                  : 'No properties available at this time.'}
              </p>
              <p className="mt-4 text-lg text-warm-ink/70">
                {hasFilters
                  ? 'Try adjusting your filters.'
                  : 'Please check back soon.'}
              </p>
            </FadeIn>
          ) : (
            <>
              <FadeIn className="mt-12">
                <p className="text-lg font-semibold text-warm-ink/70">
                  {properties.length}{' '}
                  {properties.length === 1 ? 'property' : 'properties'}{' '}
                  {hasFilters ? 'match your filters' : 'in our collection'}
                </p>
              </FadeIn>

              <FadeInStagger className="mt-8 grid gap-8 split:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <FadeIn key={property.id}>
                    <PropertyCard property={property} />
                  </FadeIn>
                ))}
              </FadeInStagger>
            </>
          )}
        </Container>
      </Band>
    </RootLayout>
  )
}
