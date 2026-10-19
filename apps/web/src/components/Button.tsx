import Link from 'next/link'
import clsx from 'clsx'

// Filled pills draw the focus ring inside, where it contrasts with the fill;
// outside, it would sit on whatever surface the button is placed on.
const tones = {
  accent: 'bg-accent text-white hover:bg-accent-deep focus-visible:-outline-offset-4',
  outline: 'bg-white text-ink ring-1 ring-line ring-inset hover:ring-ink/30',
  glass:
    'bg-white/15 text-white ring-1 ring-white/50 ring-inset backdrop-blur hover:bg-white/25',
}

const sizes = {
  md: 'px-6 py-3.5 text-base',
  sm: 'px-4.5 py-2.5 text-[0.9375rem]',
}

export type ButtonTone = keyof typeof tones

type ButtonProps = {
  tone?: ButtonTone
  size?: keyof typeof sizes
  arrow?: boolean
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
)

export function Button({
  tone = 'accent',
  size = 'md',
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
    tones[tone],
    sizes[size],
    className,
  )

  let inner = (
    <>
      {children}
      {arrow && (
        <span aria-hidden="true" className="text-[0.95em]">
          →
        </span>
      )}
    </>
  )

  if (typeof props.href === 'undefined') {
    return (
      <button className={className} {...props}>
        {inner}
      </button>
    )
  }

  return (
    <Link className={className} {...props}>
      {inner}
    </Link>
  )
}
