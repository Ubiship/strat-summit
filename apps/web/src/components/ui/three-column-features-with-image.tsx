import Image from 'next/image'
import { type LucideIcon } from 'lucide-react'

import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { cn } from '@/lib/utils'

// Layout adapted from Aceternity's "three column features with image" block,
// restyled to the site: white surface, the shared section head, and the
// sky-blue accent carried by each feature's icon.
export type Feature = {
  title: string
  description: string
  icon: LucideIcon
  image: { src: string; alt: string }
}

export function ThreeColumnFeaturesWithImage({
  kicker,
  title,
  intro,
  features,
  className,
}: {
  kicker: string
  title: string
  intro?: React.ReactNode
  features: Feature[]
  className?: string
}) {
  return (
    <section className={cn('bg-white py-24 split:py-36', className)}>
      <Container>
        <SectionHead kicker={kicker} title={title}>
          {intro}
        </SectionHead>

        <FadeInStagger className="mt-14 grid gap-14 split:mt-20 xl:grid-cols-3 xl:gap-8">
          {features.map(({ title, description, icon: Icon, image }) => (
            <FadeIn
              key={title}
              className="mx-auto flex w-full max-w-xl flex-col xl:mx-0 xl:max-w-none"
            >
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-[1.5rem] bg-mist sm:aspect-square xl:aspect-4/5">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 80rem) 24rem, (min-width: 36rem) 36rem, 100vw"
                  className="object-cover"
                />
              </div>
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="mt-7 size-6 text-accent"
              />
              <h3 className="mt-4 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </h3>
              <p className="mt-2 max-w-md text-base/[1.6] text-muted">
                {description}
              </p>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </section>
  )
}
