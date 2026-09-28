import clsx from 'clsx'

export function Kicker({
  as: Component = 'p',
  tone = 'light',
  bubble = false,
  className,
  children,
}: {
  as?: 'p' | 'h2' | 'h3' | 'span'
  tone?: 'light' | 'dark'
  bubble?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (bubble) {
    return (
      <Component
        className={clsx(
          'inline-flex items-center gap-2.5 rounded-full bg-[#2a180a]/40 py-2.5 pr-4.5 pl-2.5 text-sm font-bold tracking-[0.04em] text-warm-cream backdrop-blur-md',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="size-5.5 flex-none rounded-full bg-sun shadow-[0_0_0_6px_rgb(242_163_58/0.3)]"
        />
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={clsx(
        'flex items-center gap-2.5 text-sm font-bold tracking-[0.08em] uppercase',
        tone === 'dark' ? 'text-apricot' : 'text-ember-deep',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-4 flex-none rounded-full bg-sun"
      />
      {children}
    </Component>
  )
}
