import {
  SimpleCtaWithImages,
  type CtaImage,
} from '@/components/ui/simple-cta-with-images'
import { getProperties } from '@/lib/hostaway'
import { getPropertyHighlights } from '@/lib/propertyHighlights'

const typeLabels = { condo: 'Condo', chalet: 'Chalet', townhouse: 'Townhouse' }

const copy = {
  owners: {
    kicker: 'For owners',
    title: 'Own a place on the mountain? Let us look after it.',
    description:
      'Turnover cleaning, caretaking, and full management for Mount Washington vacation rentals, from one local team that treats your home like their own.',
    primaryAction: { label: 'Book a call', href: '/contact' },
    secondaryAction: {
      label: 'How management works',
      href: '/property-management',
    },
    caption: (count: number) =>
      `Caring for ${count} ${count === 1 ? 'property' : 'properties'} on Mount Washington`,
  },
  guests: {
    kicker: 'Plan your stay',
    title: 'Ready for your mountain escape?',
    description:
      'Condos, chalets, and townhouses on Mount Washington, cleaned and cared for by a local team. Book direct for the best rates.',
    primaryAction: { label: 'Find your stay', href: '/stays' },
    secondaryAction: { label: 'Mt Washington Info', href: '/mount-washington' },
    caption: (count: number) =>
      `${count} ${count === 1 ? 'property' : 'properties'} to choose from on Mount Washington`,
  },
}

// Closing call to action, in an owner or a guest version. The photos, count
// and rating come from the properties we manage, so nothing here is made up.
export async function PropertiesCta({
  audience,
  title,
  description,
  primaryLabel,
  secondaryAction,
}: {
  audience: keyof typeof copy
  // Optional page-specific wording; the defaults suit most pages.
  title?: string
  description?: string
  primaryLabel?: string
  secondaryAction?: { label: string; href: string } | null
}) {
  const properties = await getProperties()
  let text = copy[audience]

  let images: CtaImage[] = properties.slice(0, 6).flatMap((property) => {
    let cover = property.photos.find((p) => p.isCover) || property.photos[0]
    if (!cover) return []
    let type = getPropertyHighlights(property).type
    return [
      {
        name: property.name,
        label: type && typeLabels[type],
        src: cover.url,
      },
    ]
  })

  let rated = properties.filter((p) => p.rating)
  let rating =
    rated.length > 0
      ? rated.reduce((sum, p) => sum + p.rating!, 0) / rated.length
      : undefined

  return (
    <SimpleCtaWithImages
      kicker={text.kicker}
      title={title ?? text.title}
      description={description ?? text.description}
      primaryAction={{
        ...text.primaryAction,
        label: primaryLabel ?? text.primaryAction.label,
      }}
      secondaryAction={
        secondaryAction === null
          ? undefined
          : (secondaryAction ?? text.secondaryAction)
      }
      images={images}
      caption={
        properties.length > 0
          ? text.caption(properties.length)
          : 'Local property care on Mount Washington'
      }
      rating={rating}
    />
  )
}
