import clsx from 'clsx'

// The two card surfaces on the public site: white with a hairline, or a
// pale green fill. No drop shadows; linked cards darken their hairline.
const tones = {
  outline: 'bg-white ring-1 ring-forest-warm/12',
  tint: 'bg-sand',
}

export type CardTone = keyof typeof tones

export function cardClasses({
  tone = 'outline',
  linked = false,
}: {
  tone?: CardTone
  linked?: boolean
} = {}) {
  return clsx(
    'rounded-[2.5rem]',
    tones[tone],
    linked &&
      'relative transition hover:ring-forest-warm/35 has-focus-visible:ring-forest-warm/35',
  )
}

// Stretches a card's link over the whole card; place inside the link.
export function CardLinkCover() {
  return (
    <span aria-hidden="true" className="absolute inset-0 rounded-[2.5rem]" />
  )
}

export function IconTile({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex size-16 flex-none items-center justify-center rounded-2xl bg-forest-warm/8">
      <Icon className="size-10 text-forest-warm" />
    </div>
  )
}
