import clsx from 'clsx'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { CardLinkCover, cardClasses, IconTile } from '@/components/Card'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'

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

const contentCategories = [
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
      'Find local restaurants, cafes, and favourite spots on the mountain and in the Comox Valley.',
    linkText: 'Explore places to eat',
  },
]

export function ContentHub() {
  return (
    <Band>
      <Container>
        <SectionHead
          kicker="Explore Mount Washington"
          title="Your guide to the mountain."
          layout="split"
        >
          <p>
            Explore Mount Washington, Strathcona Provincial Park, and the Comox
            Valley through seasonal adventures and places to eat.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-14 grid gap-8 split:mt-16 split:grid-cols-3">
          {contentCategories.map((category) => (
            <FadeIn
              key={category.title}
              className={clsx(
                cardClasses({ linked: true }),
                'flex flex-col p-8 split:p-10',
              )}
            >
              <IconTile icon={category.Icon} />
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
                <CardLinkCover />
              </Link>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}
