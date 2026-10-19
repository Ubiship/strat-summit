import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import {
  ExpandablePropertyCards,
  type ExpandableProperty,
} from '@/components/ui/expandable-property-cards'
import { getProperties } from '@/lib/hostaway'
import { getPropertyHighlights } from '@/lib/propertyHighlights'
import { site } from '@/lib/site'

export async function PropertyShowcase() {
  const allProperties = await getProperties()
  const featuredProperties = allProperties.slice(0, 6)

  if (featuredProperties.length === 0) {
    return null
  }

  // Only plain data crosses into the client component.
  let cards: ExpandableProperty[] = featuredProperties.map((property) => {
    let cover = property.photos.find((p) => p.isCover) || property.photos[0]
    return {
      id: property.id,
      name: property.name,
      address: site.propertyArea,
      description: property.description,
      href: `/stays/${property.id}`,
      rating: property.rating,
      reviewCount: property.reviewCount,
      highlights: getPropertyHighlights(property),
      image: cover && { src: cover.url, alt: cover.caption || property.name },
    }
  })

  return (
    <Band tone="white">
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

        <ExpandablePropertyCards properties={cards} />

        <FadeIn className="mt-16 text-center">
          <Button href="/stays" tone="outline" arrow>
            View all properties
          </Button>
        </FadeIn>
      </Container>
    </Band>
  )
}
