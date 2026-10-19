import clsx from 'clsx'

const tones = {
  line: 'text-accent ring-1 ring-line ring-inset bg-white',
  accent: 'bg-accent text-white',
}

const sizes = {
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
}

export function NumberBadge({
  value,
  tone = 'line',
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
        'grid flex-none place-items-center rounded-full font-semibold tabular-nums',
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {String(value).padStart(2, '0')}
    </span>
  )
}
