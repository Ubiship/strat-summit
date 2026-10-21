import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PropertyCard } from '@/components/PropertyCard'
import { SectionHead } from '@/components/SectionHead'
import { getProperties } from '@/lib/hostaway'

export async function PropertyShowcase() {
  const allProperties = await getProperties()
  // Show up to 6 featured properties (currently 2: Cozy Bear and Black Dog)
  const featuredProperties = allProperties.slice(0, 6)

  if (featuredProperties.length === 0) {
    return null
  }

  return (
    <Band>
      <Container>
        <SectionHead
          kicker="Our properties"
          title="Find your mountain stay."
        >
          <p>
            Explore our collection of Mount Washington vacation rentals and find
            the right fit for your getaway.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-20 grid gap-10 split:mt-24 split:grid-cols-2 split:gap-14">
          {featuredProperties.map((property) => (
            <FadeIn key={property.id}>
              <PropertyCard property={property} />
            </FadeIn>
          ))}
        </FadeInStagger>

        <FadeIn className="mt-20 text-center split:mt-24">
          <Button href="/stays" tone="forest" arrow>
            View all properties
          </Button>
        </FadeIn>
      </Container>
    </Band>
  )
}
