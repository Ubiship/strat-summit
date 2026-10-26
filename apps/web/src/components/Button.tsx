import Link from 'next/link'
import clsx from 'clsx'

// Filled pills draw the focus ring inside, where it contrasts with the fill;
// outside, it would sit on whatever band the button is placed on.
const tones = {
  sun: 'bg-sun text-warm-ink hover:bg-sun-light focus-visible:-outline-offset-4',
  forest:
    'bg-forest-warm text-warm-cream hover:bg-forest-deep focus-visible:-outline-offset-4',
  light:
    'bg-white text-forest-warm hover:bg-sand focus-visible:-outline-offset-4',
  outline:
    'text-forest-warm ring-2 ring-forest-warm ring-inset hover:bg-forest-warm/5',
  glass:
    'bg-warm-cream/15 text-warm-cream ring-2 ring-warm-cream/60 ring-inset hover:bg-warm-cream/25',
}

const sizes = {
  lg: 'px-7 py-4.5 text-base split:px-10 split:py-5.5 split:text-[1.125rem]',
  md: 'px-6 py-4 text-base',
  sm: 'px-4.5 py-3 text-[0.9375rem]',
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
  tone = 'forest',
  size = 'md',
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
    size === 'lg' ? 'gap-3' : 'gap-2.5',
    tones[tone],
    sizes[size],
    className,
  )

  let inner = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className={clsx(
            'grid place-items-center rounded-full bg-current/15',
            size === 'lg' ? 'size-8 text-base' : 'size-7 text-sm',
          )}
        >
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
