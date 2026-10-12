import clsx from 'clsx'

const tones = {
  cream: 'bg-warm-cream text-warm-ink',
  sand: 'bg-sand text-warm-ink',
  apricot: 'bg-apricot text-warm-ink',
  sun: 'bg-sun text-warm-ink',
  forest: 'bg-forest-warm text-warm-cream',
}

export type BandTone = keyof typeof tones

export function Band({
  tone,
  as: Component = 'section',
  last = false,
  className,
  children,
}: {
  tone: BandTone
  as?: 'section' | 'footer' | 'div'
  last?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={clsx(
        'relative z-10 mt-[calc(var(--band-radius)*-1)] rounded-t-[var(--band-radius)] pt-28 split:pt-36',
        last ? 'pb-20 split:pb-24' : 'pb-[calc(var(--band-radius)+7rem)]',
        tones[tone],
        className,
      )}
    >
      {children}
    </Component>
  )
}
