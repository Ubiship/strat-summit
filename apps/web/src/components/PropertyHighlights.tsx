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
        'inline-flex rounded-full bg-forest-warm/10 px-3 py-1 text-xs font-bold tracking-wide text-forest-warm uppercase',
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
        'flex flex-wrap font-semibold text-warm-ink/80',
        size === 'sm' ? 'gap-2.5 text-sm' : 'gap-3 text-base',
        className,
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 rounded-full bg-sand px-4 py-2.5"
        >
          <Icon
            aria-hidden="true"
            strokeWidth={1.75}
            className={clsx(
              'flex-none text-forest-warm',
              size === 'sm' ? 'size-4' : 'size-5',
            )}
          />
          {label}
        </li>
      ))}
    </ul>
  )
}
