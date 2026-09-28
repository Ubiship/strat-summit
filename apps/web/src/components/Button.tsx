import Link from 'next/link'
import clsx from 'clsx'

// Filled pills draw the focus ring inside, where it contrasts with the fill;
// outside, it would sit on whatever band the button is placed on.
const tones = {
  sun: 'bg-sun text-warm-ink hover:bg-sun-light focus-visible:-outline-offset-4',
  forest:
    'bg-forest-warm text-warm-cream hover:bg-forest-deep focus-visible:-outline-offset-4',
  cream:
    'bg-warm-cream text-warm-ink hover:bg-white focus-visible:-outline-offset-4',
  glass:
    'bg-warm-cream/15 text-warm-cream ring-2 ring-warm-cream/60 ring-inset hover:bg-warm-cream/25',
}

const sizes = {
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
  tone = 'sun',
  size = 'md',
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2.5 rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
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
          className="grid size-7 place-items-center rounded-full bg-current/15 text-sm"
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
