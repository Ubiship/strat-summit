import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { categoryMetadata, getAllGuides } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

export const metadata: Metadata = {
  title: 'Discover Mount Washington',
  description:
    'Your complete guide to Mount Washington. Explore local tips, activities, and insider knowledge to make the most of your mountain getaway.',
}

const categories = [
  { slug: 'skiing', emoji: '⛷️' },
  { slug: 'summer', emoji: '🌲' },
  { slug: 'families', emoji: '👨‍👩‍👧‍👦' },
  { slug: 'getting-here', emoji: '🚗' },
  { slug: 'first-time-visitors', emoji: '🗺️' },
] as const

export default async function MountWashingtonHub() {
  const allGuides = await getAllGuides()
  const latestGuides = allGuides.slice(0, 6)

  return (
    <RootLayout>
      {/* Hero Section */}
      <Band tone="forest">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="type-display text-[clamp(3.5rem,8vw,6.5rem)] text-warm-cream">
                Discover Mount Washington
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[1.25rem]/[1.6] text-[#f1dfc6]">
                Your complete guide to Mount Washington. Explore local tips,
                activities, and insider knowledge to make the most of your
                mountain getaway.
              </p>
            </div>
          </FadeIn>
        </Container>
      </Band>

      {/* Categories Section */}
      <Band tone="sand">
        <Container>
          <SectionHead
            kicker="Browse by Topic"
            title="Find what you're looking for."
          >
            <p>
              Whether you're planning a ski trip, summer adventure, or family
              vacation, we've got you covered with expert local knowledge.
            </p>
          </SectionHead>

          <FadeInStagger className="mt-12 grid gap-6 split:grid-cols-2 wide:grid-cols-3">
            {categories.map((cat) => {
              const meta = categoryMetadata[cat.slug]
              return (
                <FadeIn
                  key={cat.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[2.75rem] bg-white p-8 shadow-[0_8px_24px_rgb(42_24_10/0.06)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]"
                >
                  <div className="mb-4 text-5xl">{cat.emoji}</div>
                  <h3 className="type-display text-[clamp(2rem,3vw,2.5rem)] text-warm-ink">
                    {meta.title}
                  </h3>
                  <p className="mt-3 flex-auto text-base/[1.5] text-warm-muted">
                    {meta.description}
                  </p>
                  <Link
                    href={`/mount-washington/category/${cat.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-forest-warm transition hover:text-forest-deep"
                  >
                    View guides
                    <span aria-hidden="true" className="text-base">
                      →
                    </span>
                  </Link>
                </FadeIn>
              )
            })}
          </FadeInStagger>
        </Container>
      </Band>

      {/* Latest Guides Section */}
      {latestGuides.length > 0 && (
        <Band tone="cream">
          <Container>
            <SectionHead kicker="Recent Guides" title="Latest from the blog.">
              <p>
                Stay up to date with the latest tips, seasonal updates, and
                insider recommendations for your Mount Washington visit.
              </p>
            </SectionHead>

            <FadeInStagger className="mt-12 grid gap-8 split:grid-cols-2 wide:grid-cols-3">
              {latestGuides.map((guide) => (
                <FadeIn
                  key={guide.slug}
                  className="group flex flex-col rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgb(42_24_10/0.04)] transition hover:shadow-[0_8px_24px_rgb(42_24_10/0.08)]"
                >
                  <div className="mb-3 flex items-center gap-3 text-sm text-warm-muted">
                    <time dateTime={guide.publishedAt}>
                      {formatDate(guide.publishedAt)}
                    </time>
                    <span>·</span>
                    <span className="capitalize">{guide.category}</span>
                  </div>
                  <h3 className="text-[1.375rem] font-bold leading-[1.3] text-warm-ink">
                    {guide.title}
                  </h3>
                  <p className="mt-2 flex-auto text-[0.9375rem]/[1.5] text-warm-muted">
                    {guide.description}
                  </p>
                  <Link
                    href={`/mount-washington/${guide.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-forest-warm transition hover:text-forest-deep"
                  >
                    Read more
                    <span aria-hidden="true" className="text-base">
                      →
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </FadeInStagger>
          </Container>
        </Band>
      )}

      {/* CTA Section */}
      <Band tone="apricot" last>
        <Container>
          <FadeIn className="mx-auto max-w-3xl text-center">
            <h2 className="type-display text-[clamp(3rem,5vw,4.5rem)] text-warm-ink">
              Ready to book your stay?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[1.1875rem]/[1.5] text-warm-muted">
              Browse our curated selection of vacation rentals at Mount
              Washington. From cozy studios to spacious chalets, find your
              perfect mountain retreat.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/stays" tone="forest" arrow>
                Browse Properties
              </Button>
              <Button href="/contact" tone="cream">
                Contact Us
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
