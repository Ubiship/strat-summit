import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PropertyCard } from '@/components/PropertyCard'
import { SectionHead } from '@/components/SectionHead'
import { getProperties } from '@/lib/hostaway'

export async function PropertyShowcase() {
  const allProperties = await getProperties()
  const featuredProperties = allProperties.slice(0, 4)

  if (featuredProperties.length === 0) {
    return null
  }

  return (
    <Band tone="sand">
      <Container>
        <SectionHead
          kicker="Featured properties"
          title="Find your perfect mountain retreat."
        >
          <p>
            From cozy alpine cabins to luxurious ski-in chalets, discover
            hand-picked vacation rentals that make Mount Washington feel like
            home.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-12 grid gap-6 split:grid-cols-2">
          {featuredProperties.map((property) => (
            <FadeIn key={property.id}>
              <PropertyCard property={property} />
            </FadeIn>
          ))}
        </FadeInStagger>

        <FadeIn className="mt-12 text-center">
          <Button href="/stays" tone="forest" arrow>
            View all properties
          </Button>
        </FadeIn>
      </Container>
    </Band>
  )
}
