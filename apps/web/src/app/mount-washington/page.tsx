import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHeroWithMarquee } from '@/components/PageHeroWithMarquee'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import iconFamilies from '@/images/icons/icon-families.png'
import iconFirstTime from '@/images/icons/icon-first-time.png'
import iconGettingHere from '@/images/icons/icon-getting-here.png'
import iconSkiing from '@/images/icons/icon-skiing.png'
import iconSummer from '@/images/icons/icon-summer.png'
import { categoryMetadata, getAllGuides } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

export const metadata: Metadata = {
  title: 'Discover Mount Washington',
  description:
    'Your complete guide to Mount Washington. Explore local tips, activities, and insider knowledge to make the most of your mountain getaway.',
}

const categories = [
  { slug: 'skiing', icon: iconSkiing },
  { slug: 'summer', icon: iconSummer },
  { slug: 'families', icon: iconFamilies },
  { slug: 'getting-here', icon: iconGettingHere },
  { slug: 'first-time-visitors', icon: iconFirstTime },
] as const

export default async function MountWashingtonHub() {
  const allGuides = await getAllGuides()
  const latestGuides = allGuides.slice(0, 6)

  return (
    <RootLayout>
      {/* Hero Section */}
      <PageHeroWithMarquee
        title="Discover Mount Washington"
        subtitle="Your complete guide to Mount Washington. Explore local tips, activities, and insider knowledge to make the most of your mountain getaway."
      />

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

          <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2 wide:grid-cols-3">
            {categories.map((cat) => {
              const meta = categoryMetadata[cat.slug]
              return (
                <FadeIn
                  key={cat.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[2.75rem] bg-white p-10 shadow-[0_8px_24px_rgb(42_24_10/0.06)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]"
                >
                  <CardIcon src={cat.icon} />
                  <h3 className="mt-8 type-display text-[clamp(2.125rem,3vw,2.625rem)] text-warm-ink">
                    {meta.title}
                  </h3>
                  <p className="mt-4 flex-auto text-[1.0625rem]/[1.6] text-warm-muted">
                    {meta.description}
                  </p>
                  <Link
                    href={`/mount-washington/category/${cat.slug}`}
                    className="mt-8 inline-flex items-center gap-2.5 text-base font-bold text-forest-warm transition hover:text-forest-deep"
                  >
                    View guides
                    <span aria-hidden="true" className="text-lg">
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

            <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2 wide:grid-cols-3">
              {latestGuides.map((guide) => (
                <FadeIn
                  key={guide.slug}
                  className="group flex flex-col rounded-[2.5rem] bg-white p-8 shadow-[0_4px_16px_rgb(42_24_10/0.04)] transition hover:shadow-[0_8px_24px_rgb(42_24_10/0.08)]"
                >
                  <div className="mb-4 flex items-center gap-3 text-sm text-warm-muted">
                    <time dateTime={guide.publishedAt}>
                      {formatDate(guide.publishedAt)}
                    </time>
                    <span>·</span>
                    <span className="capitalize">{guide.category}</span>
                  </div>
                  <h3 className="text-[1.5rem] font-bold leading-[1.3] text-warm-ink">
                    {guide.title}
                  </h3>
                  <p className="mt-3 flex-auto text-base/[1.55] text-warm-muted">
                    {guide.description}
                  </p>
                  <Link
                    href={`/mount-washington/${guide.slug}`}
                    className="mt-6 inline-flex items-center gap-2.5 text-base font-bold text-forest-warm transition hover:text-forest-deep"
                  >
                    Read more
                    <span aria-hidden="true" className="text-lg">
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
            <h2 className="type-display text-[clamp(3.25rem,5vw,4.75rem)] text-warm-ink">
              Ready to book your stay?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[1.25rem]/[1.55] text-warm-muted">
              Browse our curated selection of vacation rentals at Mount
              Washington. From cozy studios to spacious chalets, find your
              perfect mountain retreat.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-5">
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
