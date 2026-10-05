import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import type { HostawayProperty } from '@/lib/hostaway'

type PropertyCardProps = {
  property: HostawayProperty
  price?: number
  searchParams?: {
    checkIn?: string
    checkOut?: string
    guests?: string
  }
}

export function PropertyCard({
  property,
  price,
  searchParams,
}: PropertyCardProps) {
  const coverPhoto = property.photos.find((p) => p.isCover) || property.photos[0]
  const displayPrice = price || property.basePrice

  // Build detail page URL with search params
  const params = new URLSearchParams()
  if (searchParams?.checkIn) params.set('checkIn', searchParams.checkIn)
  if (searchParams?.checkOut) params.set('checkOut', searchParams.checkOut)
  if (searchParams?.guests) params.set('guests', searchParams.guests)
  const queryString = params.toString()
  const detailHref = `/stays/${property.id}${queryString ? `?${queryString}` : ''}`

  // Format key amenities (first 4)
  const keyAmenities = property.amenities?.slice(0, 4) ?? []

  return (
    <article className="flex flex-col rounded-[2.75rem] bg-white shadow-[0_8px_24px_rgb(42_24_10/0.08)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]">
      <Link
        href={detailHref}
        className="group relative aspect-[4/3] overflow-hidden rounded-t-[2.75rem]"
      >
        {coverPhoto && (
          <Image
            src={coverPhoto.url}
            alt={coverPhoto.caption || property.name}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        )}
        {property.rating && (
          <div className="absolute top-4 right-4 rounded-full bg-warm-cream/95 px-4 py-2 text-sm font-bold text-warm-ink backdrop-blur">
            ★ {property.rating.toFixed(1)}
            {property.reviewCount && (
              <span className="ml-1 text-warm-ink/60">
                ({property.reviewCount})
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="flex flex-auto flex-col p-6">
        <Link href={detailHref}>
          <h3 className="type-display text-[clamp(1.5rem,2.5vw,1.75rem)] text-warm-ink transition hover:text-forest-warm">
            {property.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-base/[1.5] text-warm-ink/70">
          {property.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-warm-ink/80">
          <span className="rounded-full bg-sand px-3.5 py-2">
            {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
          </span>
          <span className="rounded-full bg-sand px-3.5 py-2">
            {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
          </span>
          <span className="rounded-full bg-sand px-3.5 py-2">
            Sleeps {property.maxGuests}
          </span>
        </div>

        {keyAmenities.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-warm-ink/60">
            {keyAmenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-1.5">
                <span className="size-1 rounded-full bg-warm-ink/40" />
                {amenity}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-semibold text-warm-ink/60">
              {price ? 'Total price' : 'From'}
            </p>
            <p className="type-display text-[clamp(1.75rem,3vw,2rem)] text-warm-ink">
              ${displayPrice.toFixed(0)}
              {!price && <span className="text-xl font-medium">/night</span>}
            </p>
          </div>
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
