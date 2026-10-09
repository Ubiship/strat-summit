import { type StaticImageData } from 'next/image'
import { CardIcon } from '@/components/CardIcon'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

// Styled for forest bands: translucent cream cards, cream headings.
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
          className="flex min-h-[16rem] flex-col rounded-[2.5rem] bg-warm-cream/8 p-8"
        >
          {item.icon && (
            <CardIcon
              src={item.icon}
              className="mb-10 drop-shadow-[0_12px_20px_rgb(22_56_38/0.45)]"
            />
          )}
          <h3 className="type-display text-[2.125rem]">{item.title}</h3>
          <p className="mt-2.5 text-base/[1.5] text-[#f1dfc6]">
            {item.description}
          </p>
        </FadeIn>
      ))}
    </FadeInStagger>
  )
}
