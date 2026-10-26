import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import { cardClasses } from '@/components/Card'
import {
  PropertyHighlights,
  PropertyTypeLabel,
} from '@/components/PropertyHighlights'
import type { HostawayProperty } from '@/lib/hostaway'
import { getPropertyHighlights } from '@/lib/propertyHighlights'

type PropertyCardProps = {
  property: HostawayProperty
  searchParams?: {
    checkIn?: string
    checkOut?: string
    guests?: string
  }
}

export function PropertyCard({
  property,
  searchParams,
}: PropertyCardProps) {
  const coverPhoto = property.photos.find((p) => p.isCover) || property.photos[0]
  const highlights = getPropertyHighlights(property)

  // Build detail page URL with search params
  const params = new URLSearchParams()
  if (searchParams?.checkIn) params.set('checkIn', searchParams.checkIn)
  if (searchParams?.checkOut) params.set('checkOut', searchParams.checkOut)
  if (searchParams?.guests) params.set('guests', searchParams.guests)
  const queryString = params.toString()
  const detailHref = `/stays/${property.id}${queryString ? `?${queryString}` : ''}`

  return (
    <article className={clsx(cardClasses({ linked: true }), 'flex flex-col')}>
      <Link
        href={detailHref}
        className="group relative aspect-[4/3] overflow-hidden rounded-t-[2.5rem]"
      >
        {coverPhoto && (
          <Image
            src={coverPhoto.url}
            alt={coverPhoto.caption || property.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {property.rating && (
          <div className="absolute top-5 right-5 rounded-full bg-warm-cream/95 px-4 py-2.5 text-sm font-bold text-warm-ink shadow-lg backdrop-blur">
            ★ {property.rating.toFixed(1)}
            {property.reviewCount && (
              <span className="ml-1.5 text-warm-ink/60">
                ({property.reviewCount})
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="flex flex-auto flex-col p-8 split:p-10">
        <PropertyTypeLabel type={highlights.type} className="mb-3 self-start" />
        <Link href={detailHref}>
          <h3 className="type-display text-[clamp(1.625rem,2.5vw,1.875rem)] text-warm-ink transition hover:text-forest-warm">
            {property.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-[1.0625rem]/[1.6] text-warm-ink/70">
          {property.description}
        </p>

        <PropertyHighlights highlights={highlights} className="mt-5" />

        <div className="mt-auto flex justify-end pt-8">
          <Button
            href={detailHref}
            tone="forest"
            size="sm"
            arrow
          >
            View
          </Button>
        </div>
      </div>
    </article>
  )
}
