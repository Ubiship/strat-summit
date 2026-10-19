import clsx from 'clsx'

import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

export function SectionHead({
  kicker,
  title,
  tone = 'light',
  align = 'start',
  className,
  children,
}: {
  kicker?: string
  title: string
  tone?: 'light' | 'dark'
  align?: 'start' | 'center'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <FadeIn
      className={clsx(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center [&>p:first-child]:justify-center',
        className,
      )}
    >
      {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
      <h2
        className={clsx(
          'type-display text-[clamp(2.5rem,5vw,4rem)] text-balance',
          kicker && 'mt-4',
        )}
      >
        {title}
      </h2>
      {children && (
        <div
          className={clsx(
            'mt-6 max-w-[52ch] space-y-4 text-[1.1875rem]/[1.55] text-pretty',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-white/80' : 'text-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
