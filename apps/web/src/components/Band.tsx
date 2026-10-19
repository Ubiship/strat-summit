import clsx from 'clsx'

// Sections are separated by white space, not colour. Mist and tint are for
// the occasional section that needs a quiet surface; accent is reserved for at
// most one anchoring section per page.
const tones = {
  white: 'bg-white text-ink',
  mist: 'bg-mist text-ink',
  tint: 'bg-tint text-ink',
  accent: 'bg-accent text-white',
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
        'relative py-24 split:py-36',
        last && 'pb-16 split:pb-20',
        tones[tone],
        className,
      )}
    >
      {children}
    </Component>
  )
}
