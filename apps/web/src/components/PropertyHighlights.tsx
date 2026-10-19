import clsx from 'clsx'
import { Bath, BedDouble, PawPrint, Users, Waves } from 'lucide-react'

import type { PropertyHighlights as Highlights } from '@/lib/propertyHighlights'

const typeLabels = {
  condo: 'Condo',
  chalet: 'Chalet',
  townhouse: 'Townhouse',
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

export function PropertyTypeLabel({
  type,
  className,
}: {
  type?: Highlights['type']
  className?: string
}) {
  if (!type) return null

  return (
    <span
      className={clsx(
        'inline-flex rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-accent',
        className,
      )}
    >
      {typeLabels[type]}
    </span>
  )
}

// Only features the listing actually has are shown; a missing hot tub or pet
// policy is simply left out rather than shown as a negative.
export function PropertyHighlights({
  highlights,
  size = 'sm',
  className,
}: {
  highlights: Highlights
  size?: 'sm' | 'lg'
  className?: string
}) {
  let items = [
    {
      icon: BedDouble,
      label: plural(highlights.bedrooms, 'bedroom', 'bedrooms'),
    },
    {
      icon: Bath,
      label: plural(highlights.bathrooms, 'bathroom', 'bathrooms'),
    },
    { icon: Users, label: `Sleeps ${highlights.guests}` },
    highlights.hotTub && { icon: Waves, label: 'Private hot tub' },
    highlights.petFriendly && { icon: PawPrint, label: 'Pet-friendly' },
  ].filter((item) => !!item)

  return (
    <ul
      role="list"
      className={clsx(
        'flex flex-wrap',
        size === 'sm'
          ? 'gap-x-4 gap-y-2 text-[0.875rem] text-muted'
          : 'gap-x-8 gap-y-4 text-base text-ink',
        className,
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon
            aria-hidden="true"
            strokeWidth={1.75}
            className={clsx(
              'flex-none text-accent',
              size === 'sm' ? 'size-4' : 'size-5',
            )}
          />
          {label}
        </li>
      ))}
    </ul>
  )
}
