import Image from 'next/image'
import clsx from 'clsx'

import { site } from '@/lib/site'

// The icon PNG has heavy white padding, so it is scaled up inside a clipped circle.
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'relative block size-13 flex-none overflow-hidden rounded-full bg-white shadow-[0_8px_20px_rgb(42_24_10/0.08)]',
        className,
      )}
    >
      <Image
        src={site.logos.icon}
        alt=""
        width={320}
        height={320}
        preload
        className="size-full scale-[2.7] object-cover"
      />
    </span>
  )
}

export function Logo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      <LogoMark className={markClassName} />
      <span className="type-display text-xl/[1.05]">{site.shortName}</span>
    </span>
  )
}
