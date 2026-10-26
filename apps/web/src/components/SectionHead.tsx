import clsx from 'clsx'

import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

export function SectionHead({
  kicker,
  title,
  tone = 'light',
  className,
  children,
}: {
  kicker?: string
  title: string
  tone?: 'light' | 'dark'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <FadeIn className={clsx('max-w-3xl', className)}>
      {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
      <h2
        className={clsx(
          'type-display text-[clamp(2.75rem,5vw,4.25rem)] text-balance',
          kicker && 'mt-5',
        )}
      >
        {title}
      </h2>
      {children && (
        <div
          className={clsx(
            'mt-7 max-w-[50ch] space-y-5 text-[1.1875rem]/[1.65] text-pretty',
            tone === 'dark' ? 'text-white/80' : 'text-warm-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
