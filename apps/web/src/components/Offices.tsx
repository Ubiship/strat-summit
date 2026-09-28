import clsx from 'clsx'

export function Offices({
  invert = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'ul'> & { invert?: boolean }) {
  return (
    <ul role="list" className={className} {...props}>
      <li>
        <address
          className={clsx(
            'text-base/[1.5] not-italic',
            invert ? 'text-warm-cream/80' : 'text-warm-muted',
          )}
        >
          <strong
            className={clsx(
              'block type-display text-3xl',
              invert ? 'text-warm-cream' : 'text-warm-ink',
            )}
          >
            Mount Washington
          </strong>
          <span className="mt-2 block">
            Serving Mount Washington properties and the surrounding Comox
            Valley.
          </span>
        </address>
      </li>
    </ul>
  )
}
