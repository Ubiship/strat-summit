import clsx from 'clsx'

function MountainMark({
  invert = false,
  filled = false,
  className,
}: {
  invert?: boolean
  filled?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 26 12 8l4 8 6-14 6 24H4Z"
        className={clsx(
          'transition-colors duration-300',
          filled
            ? invert
              ? 'fill-copper'
              : 'fill-copper'
            : invert
              ? 'fill-white'
              : 'fill-neutral-950',
        )}
      />
      <path
        d="M4 26h24"
        className={clsx(
          'stroke-[1.5]',
          invert ? 'stroke-white/80' : 'stroke-neutral-950/60',
        )}
        fill="none"
      />
    </svg>
  )
}

export function Logomark({
  invert = false,
  filled = false,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  invert?: boolean
  filled?: boolean
}) {
  return (
    <MountainMark
      invert={invert}
      filled={filled}
      className={clsx('h-8 w-8', props.className)}
    />
  )
}

export function Logo({
  className,
  invert = false,
  filled = false,
  fillOnHover = false,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  invert?: boolean
  filled?: boolean
  fillOnHover?: boolean
}) {
  return (
    <svg
      viewBox="0 0 200 32"
      aria-hidden="true"
      className={clsx(fillOnHover && 'group/logo', className)}
      {...props}
    >
      <MountainMark
        invert={invert}
        filled={filled}
        className="h-8 w-8"
      />
      <text
        x="40"
        y="22"
        className={clsx(
          'font-display text-[15px] font-semibold tracking-tight',
          invert ? 'fill-white' : 'fill-neutral-950',
        )}
      >
        Strathcona Summit
      </text>
    </svg>
  )
}
