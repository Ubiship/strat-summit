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
    <FadeIn
      className={clsx(
        'grid gap-6 split:grid-cols-[1.1fr_0.9fr] split:items-end split:gap-10',
        className,
      )}
    >
      <div>
        {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
        <h2
          className={clsx(
            'type-display text-[clamp(3.25rem,6vw,5.5rem)] text-balance',
            kicker && 'mt-4',
          )}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={clsx(
            'max-w-[38ch] space-y-4 text-[1.1875rem]/[1.5]',
            tone === 'dark' ? 'text-[#f1dfc6]' : 'text-warm-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
