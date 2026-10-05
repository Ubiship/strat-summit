import { type Metadata } from 'next'
import { unstable_cache } from 'next/cache'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { RootLayout } from '@/components/RootLayout'
import { SearchBar } from '@/components/SearchBar'
import { site } from '@/lib/site'
import {
  getProperties,
  getAvailability,
  getPricing,
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
  priceRange?: string
}>

// Cache property list for 1 hour
const getCachedProperties = unstable_cache(
  async () => {
    return await getProperties()
  },
  ['properties-list'],
  { revalidate: 3600 },
)

async function filterAndEnrichProperties(
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
      requiredAmenities.every((amenity) => p.amenities.includes(amenity)),
    )
  }

  // Filter by price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split('-').map(Number)
    filtered = filtered.filter(
      (p) => p.basePrice >= min && p.basePrice <= max,
    )
  }

  // If dates provided, fetch availability and pricing
  if (filters.checkIn && filters.checkOut) {
    const enrichedProperties = await Promise.all(
      filtered.map(async (property) => {
        const guests = parseInt(filters.guests || '2')

        // Check availability
        const availability = await getAvailability(
          property.id.toString(),
          filters.checkIn!,
          filters.checkOut!,
        )

        const isAvailable = availability.every((day) => day.available)

        if (!isAvailable) {
          return null
        }

        // Get pricing if available
        const pricing = await getPricing(
          property.id.toString(),
          filters.checkIn!,
          filters.checkOut!,
          guests,
        )

        return {
          property,
          price: pricing?.total,
        }
      }),
    )

    // Filter out unavailable properties
    return enrichedProperties.filter((p) => p !== null) as {
      property: HostawayProperty
      price?: number
    }[]
  }

  // No dates, return filtered properties without pricing
  return filtered.map((property) => ({ property, price: undefined }))
}

export default async function StaysPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const allProperties = await getCachedProperties()
  const propertiesWithPricing = await filterAndEnrichProperties(
    allProperties,
    searchParams,
  )

  const hasSearchParams =
    searchParams.checkIn || searchParams.checkOut || searchParams.guests

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

      <Band tone="cream">
        <Container>
          <FadeIn>
            <SearchBar />
          </FadeIn>

          <FadeIn className="mt-8">
            <PropertyFilters />
          </FadeIn>

          {propertiesWithPricing.length === 0 ? (
            <FadeIn className="mt-16 text-center">
              <p className="type-display text-[clamp(1.5rem,2.5vw,2rem)] text-warm-ink">
                {hasSearchParams
                  ? 'No properties match your search criteria.'
                  : 'No properties available at this time.'}
              </p>
              <p className="mt-4 text-lg text-warm-ink/70">
                {hasSearchParams
                  ? 'Try adjusting your dates, guest count, or filters.'
                  : 'Please check back soon.'}
              </p>
            </FadeIn>
          ) : (
            <>
              <FadeIn className="mt-12">
                <p className="text-lg font-semibold text-warm-ink/70">
                  {propertiesWithPricing.length}{' '}
                  {propertiesWithPricing.length === 1 ? 'property' : 'properties'}{' '}
                  {hasSearchParams ? 'available' : 'in our collection'}
                </p>
              </FadeIn>

              <FadeInStagger className="mt-8 grid gap-8 split:grid-cols-2 xl:grid-cols-3">
                {propertiesWithPricing.map(({ property, price }) => (
                  <FadeIn key={property.id}>
                    <PropertyCard
                      property={property}
                      price={price}
                      searchParams={searchParams}
                    />
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
