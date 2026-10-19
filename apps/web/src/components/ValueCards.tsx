import { type StaticImageData } from 'next/image'

import { CardIcon } from '@/components/CardIcon'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

// Hairline white cards; they sit on white, mist, or tint bands alike.
export function ValueCards({
  items,
}: {
  items: Array<{ title: string; description: string; icon?: StaticImageData }>
}) {
  return (
    <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-3">
      {items.map((item) => (
        <FadeIn
          key={item.title}
          className="flex flex-col rounded-[1.5rem] border border-line bg-white p-8"
        >
          {item.icon && <CardIcon src={item.icon} size="sm" className="mb-6" />}
          <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em]">
            {item.title}
          </h3>
          <p className="mt-2 text-base/[1.6] text-muted">{item.description}</p>
        </FadeIn>
      ))}
    </FadeInStagger>
  )
}
