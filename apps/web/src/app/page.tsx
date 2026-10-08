import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { HeroWithSearch } from '@/components/HeroWithSearch'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { PropertyShowcase } from '@/components/PropertyShowcase'
import { ReviewCarousel } from '@/components/ReviewCarousel'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { WhyBookDirect } from '@/components/WhyBookDirect'
import iconActivities from '@/images/icons/icon-activities.png'
import iconDining from '@/images/icons/icon-dining.png'
import iconPlanning from '@/images/icons/icon-planning.png'

export const metadata: Metadata = {
  description:
    'Book vacation rentals on Mount Washington directly with us. Best rates guaranteed, local hosts, and exceptional mountain experiences.',
}

const contentCategories = [
  {
    title: 'Activities',
    href: '/mount-washington/activities',
    icon: iconActivities,
    description:
      'Skiing, snowboarding, hiking, and mountain biking—discover year-round adventures on Mount Washington.',
  },
  {
    title: 'Planning',
    href: '/mount-washington/planning',
    icon: iconPlanning,
    description:
      'Weather guides, packing lists, and local tips to help you plan the perfect mountain getaway.',
  },
  {
    title: 'Dining',
    href: '/mount-washington/dining',
    icon: iconDining,
    description:
      'Find the best restaurants, cafes, and mountain dining experiences near your rental property.',
  },
]

function ContentHub() {
  return (
    <Band tone="sand">
      <Container>
        <SectionHead
          kicker="Explore Mount Washington"
          title="Your guide to the mountain."
        >
          <p>
            Beyond booking, we&apos;re here to help you make the most of your Mount
            Washington experience. Explore our local guides and insider tips.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-3">
          {contentCategories.map((category) => (
            <FadeIn
              key={category.title}
              className="flex flex-col rounded-[2.75rem] bg-white p-10 shadow-[0_8px_24px_rgb(42_24_10/0.06)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]"
            >
              <CardIcon src={category.icon} />
              <h3 className="mt-8 type-display text-[clamp(2.125rem,3vw,2.625rem)] text-warm-ink">
                {category.title}
              </h3>
              <p className="mt-4 flex-auto text-[1.0625rem]/[1.6] text-warm-muted">
                {category.description}
              </p>
              <Link
                href={category.href}
                className="mt-8 inline-flex items-center gap-2.5 text-base font-bold text-forest-warm transition hover:text-forest-deep"
              >
                Explore {category.title.toLowerCase()}
                <span aria-hidden="true" className="text-lg">
                  →
                </span>
              </Link>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}

export default function Home() {
  return (
    <>
      <EntrySplash />
      <RootLayout>
        <HeroWithSearch />
        <PropertyShowcase />
        <WhyBookDirect />
        <ReviewCarousel />
        <ContentHub />
        <Band tone="apricot" last>
          <Container>
            <NewsletterSignup />
          </Container>
        </Band>
      </RootLayout>
    </>
  )
}
