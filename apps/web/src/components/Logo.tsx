import Image from 'next/image'
import clsx from 'clsx'

import { site } from '@/lib/site'

// logo-mark.png is the icon cropped tight with a transparent surround, so it
// sits directly on the page with no backing shape.
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={site.logos.mark}
      alt=""
      width={640}
      height={366}
      preload
      className={clsx('h-8 w-auto flex-none', className)}
    />
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      <LogoMark />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.01em]">
        {site.shortName}
      </span>
    </span>
  )
}
