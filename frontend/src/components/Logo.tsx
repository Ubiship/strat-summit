import Image from 'next/image'
import clsx from 'clsx'

import { site } from '@/lib/site'

export const logoAssets = {
  icon: '/STRATLOGO-ICON.png',
  full: '/STRAT.LOGO.png',
} as const

type LogoProps = {
  invert?: boolean
  fillOnHover?: boolean
  className?: string
  size?: 'header' | 'footer' | 'splash'
}

const sizeClasses = {
  header: 'max-h-16 w-auto sm:max-h-24',
  footer: 'max-h-28 w-auto sm:max-h-32',
  splash: 'h-auto w-full max-w-sm sm:max-w-md',
} as const

export function Logomark({ className }: LogoProps) {
  return (
    <Image
      src={logoAssets.icon}
      alt=""
      width={80}
      height={80}
      className={clsx('h-14 w-14 object-contain', className)}
      priority
    />
  )
}

export function Logo({
  invert = false,
  className,
  fillOnHover = false,
  size = 'header',
}: LogoProps) {
  const image = (
    <Image
      src={logoAssets.full}
      alt={site.name}
      width={480}
      height={270}
      className={clsx(
        'h-auto object-contain object-left',
        sizeClasses[size],
        className,
      )}
      priority={size !== 'footer'}
    />
  )

  if (invert) {
    return (
      <span
        className={clsx(
          'inline-flex rounded-xl bg-white px-3 py-2 sm:px-4 sm:py-2.5',
          fillOnHover &&
            'group/logo transition-transform group-hover/logo:scale-[1.02]',
        )}
      >
        {image}
      </span>
    )
  }

  return (
    <span
      className={clsx(
        fillOnHover &&
          'group/logo inline-flex transition-transform group-hover/logo:scale-[1.02]',
      )}
    >
      {image}
    </span>
  )
}
