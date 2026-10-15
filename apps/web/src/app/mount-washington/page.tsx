import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Explore Mount Washington',
  description:
    'Plan your mountain getaway with our local guide to seasonal adventures, places to eat, and helpful tips for your visit.',
}

function IconWinter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M24 4v40M4 24h40M10 10l28 28M38 10 10 38" />
      <circle cx="24" cy="24" r="4" />
    </svg>
  )
}

function IconSummer({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="24" cy="24" r="8" />
      <path d="M24 4v4M24 40v4M4 24h4M40 24h4M9.86 9.86l2.83 2.83M35.31 35.31l2.83 2.83M9.86 38.14l2.83-2.83M35.31 12.69l2.83-2.83" />
    </svg>
  )
}

function IconDining({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 6v10c0 3.314 2.686 6 6 6v0c3.314 0 6-2.686 6-6V6" />
      <path d="M18 22v20" />
      <path d="M30 6v36" />
      <path d="M30 6c4 0 6 4 6 10s-2 10-6 10" />
    </svg>
  )
}

function IconPlan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M6 18h36" />
      <path d="M16 6v8M32 6v8" />
      <path d="M16 26h8M16 34h16" />
    </svg>
  )
}

const guideCategories = [
  {
    title: 'Winter Activities',
    href: '/mount-washington/category/winter',
    Icon: IconWinter,
    description:
      'Discover skiing, snowshoeing, tubing, and more ways to enjoy the snow.',
    linkText: 'Explore winter activities',
  },
  {
    title: 'Summer Activities',
    href: '/mount-washington/category/summer',
    Icon: IconSummer,
    description:
      'Explore hiking trails, mountain biking, lakes, and adventures beyond the mountain.',
    linkText: 'Explore summer activities',
  },
  {
    title: 'Where to Eat',
    href: '/mount-washington/category/dining',
    Icon: IconDining,
    description:
      'Find local restaurants, cafés, and favourite spots on the mountain and in the Comox Valley.',
    linkText: 'Explore places to eat',
  },
  {
    title: 'Before You Visit',
    href: '/mount-washington/category/planning',
    Icon: IconPlan,
    description:
      'Getting here, what to pack, and practical information for your trip.',
    linkText: 'Plan your trip',
  },
]

export default function MountWashingtonHub() {
  return (
    <RootLayout>
      {/* Hero Section */}
      <PageHero
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

      {/* Categories Section */}
      <Band tone="sand">
        <Container>
          <SectionHead kicker="Local guides" title="Plan your visit." />

          <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2">
            {guideCategories.map((category) => (
              <FadeIn
                key={category.title}
                className="flex flex-col rounded-[3rem] bg-white p-10 shadow-[0_8px_32px_rgb(42_24_10/0.06),0_2px_8px_rgb(42_24_10/0.03)] transition hover:shadow-[0_16px_48px_rgb(42_24_10/0.1)] split:p-12"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-forest-warm/8">
                  <category.Icon className="size-10 text-forest-warm" />
                </div>
                <h3 className="mt-10 type-display text-[clamp(2rem,3vw,2.5rem)] text-warm-ink">
                  {category.title}
                </h3>
                <p className="mt-5 flex-auto text-[1.0625rem]/[1.7] text-warm-muted">
                  {category.description}
                </p>
                <Link
                  href={category.href}
                  className="mt-10 inline-flex items-center gap-3 text-base font-bold text-forest-warm transition hover:text-forest-deep"
                >
                  {category.linkText}
                  <span aria-hidden="true" className="text-lg">
                    →
                  </span>
                </Link>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      {/* CTA Section */}
      <Band tone="apricot" last>
        <Container>
          <FadeIn className="mx-auto max-w-3xl text-center">
            <h2 className="type-display text-[clamp(3.25rem,5vw,4.75rem)] text-warm-ink">
              Ready to book your stay?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[1.25rem]/[1.55] text-warm-muted">
              Browse our Mount Washington vacation rentals and find your
              mountain stay.
            </p>
            <div className="mt-14 flex flex-wrap justify-center gap-5">
              <Button href="/stays" tone="forest" size="lg" arrow>
                Browse Properties
              </Button>
              <Button href="/contact" tone="cream" size="lg">
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
