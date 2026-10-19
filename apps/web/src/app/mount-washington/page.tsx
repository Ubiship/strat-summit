import { type Metadata } from 'next'
import Link from 'next/link'
import {
  type LucideIcon,
  CalendarCheck,
  Snowflake,
  Sun,
  UtensilsCrossed,
} from 'lucide-react'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Explore Mount Washington',
  description:
    'Plan your mountain getaway with our local guide to seasonal adventures, places to eat, and helpful tips for your visit.',
}

const guideCategories: {
  title: string
  href: string
  icon: LucideIcon
  description: string
  linkText: string
}[] = [
  {
    title: 'Winter Activities',
    href: '/mount-washington/category/winter',
    icon: Snowflake,
    description:
      'Discover skiing, snowshoeing, tubing, and more ways to enjoy the snow.',
    linkText: 'Explore winter activities',
  },
  {
    title: 'Summer Activities',
    href: '/mount-washington/category/summer',
    icon: Sun,
    description:
      'Explore hiking trails, mountain biking, lakes, and adventures beyond the mountain.',
    linkText: 'Explore summer activities',
  },
  {
    title: 'Where to Eat',
    href: '/mount-washington/category/dining',
    icon: UtensilsCrossed,
    description:
      'Find local restaurants, cafés, and favourite spots on the mountain and in the Comox Valley.',
    linkText: 'Explore places to eat',
  },
  {
    title: 'Before You Visit',
    href: '/mount-washington/category/planning',
    icon: CalendarCheck,
    description:
      'Getting here, what to pack, and practical information for your trip.',
    linkText: 'Plan your trip',
  },
]

export default function MountWashingtonHub() {
  return (
    <RootLayout>
      <PageHero
        kicker="Mt Washington Info"
        title="Explore Mount Washington"
        size="short"
        image={{
          src: site.images.hero,
          alt: 'Mount Washington alpine landscape',
        }}
      >
        <p>
          Plan your mountain getaway with our local guide to seasonal
          adventures, places to eat, and helpful tips for your visit.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <SectionHead kicker="Local guides" title="Plan your visit." />

          <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2">
            {guideCategories.map(({ icon: Icon, ...category }) => (
              <FadeIn
                key={category.title}
                className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40 split:p-10"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-7 text-accent"
                />
                <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                  <Link
                    href={category.href}
                    className="after:absolute after:inset-0"
                  >
                    {category.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-auto text-base/[1.6] text-muted">
                  {category.description}
                </p>
                <p
                  aria-hidden="true"
                  className="mt-6 text-[0.9375rem] font-medium text-accent"
                >
                  {category.linkText} →
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
