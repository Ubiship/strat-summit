import clsx from 'clsx'

const tones = {
  cream: 'bg-warm-cream text-warm-ink',
  ink: 'bg-warm-ink text-warm-cream',
  sun: 'bg-sun text-warm-ink',
}

const sizes = {
  md: 'size-14 text-base',
  lg: 'size-16 text-lg',
}

export function NumberBadge({
  value,
  tone = 'cream',
  size = 'md',
  className,
}: {
  value: number
  tone?: keyof typeof tones
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid flex-none place-items-center rounded-full font-extrabold',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {String(value).padStart(2, '0')}
    </span>
  )
}
