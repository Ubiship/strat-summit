import { FadeIn, FadeInStagger } from '@/components/FadeIn'

// Styled for forest bands: translucent cream cards, cream headings.
export function ValueCards({
  items,
}: {
  items: Array<{ title: string; description: string }>
}) {
  return (
    <FadeInStagger className="mt-14 grid gap-4.5 split:grid-cols-3">
      {items.map((item) => (
        <FadeIn
          key={item.title}
          className="flex min-h-[16rem] flex-col rounded-[2.5rem] bg-warm-cream/8 p-8"
        >
          <span
            aria-hidden="true"
            className="size-16 flex-none rounded-full sun-orb"
          />
          <h3 className="mt-12 type-display text-[2.125rem]">{item.title}</h3>
          <p className="mt-2.5 text-base/[1.5] text-[#f1dfc6]">
            {item.description}
          </p>
        </FadeIn>
      ))}
    </FadeInStagger>
  )
}
