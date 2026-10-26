import clsx from 'clsx'

import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

// stack: kicker, title and intro in one column.
// split: title on the left, intro on the right from the split breakpoint.
// center: a centred stack for single-focus moments.
export function SectionHead({
  kicker,
  title,
  tone = 'light',
  layout = 'stack',
  className,
  children,
}: {
  kicker?: string
  title: string
  tone?: 'light' | 'dark'
  layout?: 'stack' | 'split' | 'center'
  className?: string
  children?: React.ReactNode
}) {
  return (
    <FadeIn
      className={clsx(
        layout === 'stack' && 'max-w-3xl',
        layout === 'center' && 'mx-auto max-w-3xl text-center',
        layout === 'split' &&
          'grid gap-7 split:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] split:items-end split:gap-20',
        className,
      )}
    >
      <div>
        {kicker && (
          <Kicker
            tone={tone}
            className={clsx(layout === 'center' && 'justify-center')}
          >
            {kicker}
          </Kicker>
        )}
        <h2
          className={clsx(
            'type-display text-[clamp(2.75rem,5vw,4.25rem)] text-balance',
            kicker && 'mt-5',
          )}
        >
          {title}
        </h2>
      </div>
      {children && (
        <div
          className={clsx(
            'max-w-[50ch] space-y-5 text-[1.1875rem]/[1.65] text-pretty',
            layout === 'stack' && 'mt-7',
            layout === 'center' && 'mx-auto mt-7',
            layout === 'split' && 'split:pb-2',
            tone === 'dark' ? 'text-white/80' : 'text-warm-muted',
          )}
        >
          {children}
        </div>
      )}
    </FadeIn>
  )
}
