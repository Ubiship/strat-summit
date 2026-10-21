import clsx from 'clsx'

export function Band({
  as: Component = 'section',
  last = false,
  className,
  children,
}: {
  as?: 'section' | 'footer' | 'div'
  last?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={clsx(
        'relative z-10 mt-[calc(var(--band-radius)*-1)] rounded-t-[var(--band-radius)] border-t border-forest-warm/12 bg-white pt-28 text-warm-ink split:pt-44',
        last
          ? 'pb-20 split:pb-24'
          : 'pb-[calc(var(--band-radius)+7rem)] split:pb-[calc(var(--band-radius)+9rem)]',
        className,
      )}
    >
      {children}
    </Component>
  )
}
