import { type StaticImageData } from 'next/image'
import clsx from 'clsx'
import { cardClasses } from '@/components/Card'
import { CardIcon } from '@/components/CardIcon'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

// Pale green cards on white bands.
export function ValueCards({
  items,
}: {
  items: Array<{ title: string; description: string; icon?: StaticImageData }>
}) {
  return (
    <FadeInStagger className="mt-14 grid gap-4.5 split:grid-cols-3">
      {items.map((item) => (
        <FadeIn
          key={item.title}
          className={clsx(
            cardClasses({ tone: 'tint' }),
            'flex min-h-[16rem] flex-col p-8 split:p-10',
          )}
        >
          {item.icon && (
            <CardIcon
              src={item.icon}
              className="mb-10 drop-shadow-[0_12px_20px_rgb(22_56_38/0.15)]"
            />
          )}
          <h3 className="type-display text-[2.125rem] text-warm-ink">
            {item.title}
          </h3>
          <p className="mt-2.5 text-base/[1.5] text-warm-muted">
            {item.description}
          </p>
        </FadeIn>
      ))}
    </FadeInStagger>
  )
}
