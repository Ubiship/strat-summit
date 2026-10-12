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
    <article className="flex flex-col rounded-[3rem] bg-white shadow-[0_8px_32px_rgb(42_24_10/0.08),0_2px_8px_rgb(42_24_10/0.04)] transition hover:shadow-[0_16px_48px_rgb(42_24_10/0.12),0_4px_12px_rgb(42_24_10/0.06)]">
      <Link
        href={detailHref}
        className="group relative aspect-[4/3] overflow-hidden rounded-t-[3rem]"
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

      <div className="flex flex-auto flex-col p-8">
        <Link href={detailHref}>
          <h3 className="type-display text-[clamp(1.625rem,2.5vw,1.875rem)] text-warm-ink transition hover:text-forest-warm">
            {property.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-[1.0625rem]/[1.6] text-warm-ink/70">
          {property.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5 text-sm font-semibold text-warm-ink/80">
          <span className="rounded-full bg-sand px-4 py-2.5">
            {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
          </span>
          <span className="rounded-full bg-sand px-4 py-2.5">
            {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
          </span>
          <span className="rounded-full bg-sand px-4 py-2.5">
            Sleeps {property.maxGuests}
          </span>
        </div>

        {keyAmenities.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-warm-ink/60">
            {keyAmenities.map((amenity) => (
              <li key={amenity} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-warm-ink/40" />
                {amenity}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div>
            <p className="text-sm font-semibold tracking-wide text-warm-ink/50 uppercase">
              {price ? 'Total price' : 'From'}
            </p>
            <p className="mt-1 type-display text-[clamp(1.875rem,3vw,2.125rem)] text-warm-ink">
              ${displayPrice.toFixed(0)}
              {!price && <span className="text-lg font-medium text-warm-ink/70">/night</span>}
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
