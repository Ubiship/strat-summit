import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { HeroSearch } from '@/components/HeroSearch'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { PropertyShowcase } from '@/components/PropertyShowcase'
import { ReviewCarousel } from '@/components/ReviewCarousel'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { WhyBookDirect } from '@/components/WhyBookDirect'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  description:
    'Book vacation rentals on Mount Washington directly with us. Best rates guaranteed, local hosts, and exceptional mountain experiences.',
}

const contentCategories = [
  {
    title: 'Activities',
    href: '/mount-washington/activities',
    description:
      'Skiing, snowboarding, hiking, and mountain biking—discover year-round adventures on Mount Washington.',
  },
  {
    title: 'Planning',
    href: '/mount-washington/planning',
    description:
      'Weather guides, packing lists, and local tips to help you plan the perfect mountain getaway.',
  },
  {
    title: 'Dining',
    href: '/mount-washington/dining',
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

        <FadeInStagger className="mt-12 grid gap-6 split:grid-cols-3">
          {contentCategories.map((category) => (
            <FadeIn
              key={category.title}
              className="flex flex-col rounded-[2.75rem] bg-white p-8 shadow-[0_8px_24px_rgb(42_24_10/0.06)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]"
            >
              <h3 className="type-display text-[clamp(2rem,3vw,2.5rem)] text-warm-ink">
                {category.title}
              </h3>
              <p className="mt-3 flex-auto text-base/[1.5] text-warm-muted">
                {category.description}
              </p>
              <Link
                href={category.href}
                className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-forest-warm transition hover:text-forest-deep"
              >
                Explore {category.title.toLowerCase()}
                <span aria-hidden="true" className="text-base">
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
        <HeroSearch />
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
