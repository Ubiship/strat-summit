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
            invert ? 'text-white/80' : 'text-muted',
          )}
        >
          <strong
            className={clsx(
              'block text-[1.375rem] font-semibold tracking-[-0.02em]',
              invert ? 'text-white' : 'text-ink',
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
