import clsx from 'clsx'

// The highlight dot is the small spot of colour on most screens.
export function Kicker({
  as: Component = 'p',
  tone = 'light',
  className,
  children,
}: {
  as?: 'p' | 'h2' | 'h3' | 'span'
  tone?: 'light' | 'dark'
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={clsx(
        'flex items-center gap-2 text-sm font-semibold tracking-[0.02em]',
        tone === 'dark' ? 'text-white/85' : 'text-accent',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-highlight" />
      {children}
    </Component>
  )
}
