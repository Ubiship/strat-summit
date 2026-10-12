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
        'grid gap-8 split:grid-cols-[1.1fr_0.9fr] split:items-end split:gap-16',
        className,
      )}
    >
      <div>
        {kicker && <Kicker tone={tone}>{kicker}</Kicker>}
        <h2
          className={clsx(
            'type-display text-[clamp(3rem,6vw,5rem)] text-balance',
            kicker && 'mt-5',
          )}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={clsx(
            'max-w-[40ch] space-y-5 text-[1.1875rem]/[1.6]',
            tone === 'dark' ? 'text-[#f1dfc6]' : 'text-warm-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
