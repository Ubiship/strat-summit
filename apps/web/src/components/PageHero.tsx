import Image from 'next/image'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'

const heights = {
  full: 'min-h-svh',
  page: 'min-h-[38rem] split:min-h-[46rem]',
  short: 'min-h-[30rem] split:min-h-[34rem]',
}

const titleSizes = {
  full: 'max-w-[11ch] text-[clamp(4rem,9vw,8.5rem)]',
  page: 'max-w-[14ch] text-[clamp(3.25rem,7vw,6.5rem)]',
  short: 'max-w-[16ch] text-[clamp(3rem,6vw,5.5rem)]',
}

export function PageHero({
  kicker,
  title,
  image,
  size = 'page',
  actions,
  children,
}: {
  kicker?: string
  title: string
  image?: { src: string; alt: string; position?: string }
  size?: keyof typeof heights
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section
      className={clsx(
        'relative isolate z-0 flex flex-col overflow-hidden text-warm-cream',
        heights[size],
      )}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover photo-warm"
          style={{ objectPosition: image.position ?? 'center 42%' }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-20 hero-fill" />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hero-shade" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hero-glow" />

      <Container className="mt-auto pt-40 pb-[calc(var(--band-radius)+4.5rem)]">
        <FadeIn>
          {kicker && <Kicker bubble>{kicker}</Kicker>}
          <h1
            className={clsx(
              'type-display text-balance [text-shadow:0_4px_30px_rgb(42_24_10/0.25)]',
              kicker && 'mt-5.5',
              titleSizes[size],
            )}
          >
            {title}
          </h1>
          {(children || actions) && (
            <div className="mt-8 flex flex-col gap-8 split:flex-row split:items-end split:justify-between">
              {children && (
                <div className="max-w-[44ch] space-y-5 text-[1.1875rem]/[1.5] text-[#fbeedd]">
                  {children}
                </div>
              )}
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          )}
        </FadeIn>
      </Container>
    </section>
  )
}
