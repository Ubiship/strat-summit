import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import iconFamilies from '@/images/icons/icon-families.png'
import iconFirstTime from '@/images/icons/icon-first-time.png'
import iconGettingHere from '@/images/icons/icon-getting-here.png'
import iconSkiing from '@/images/icons/icon-skiing.png'
import iconSummer from '@/images/icons/icon-summer.png'
import { categoryMetadata, getAllGuides } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import { site } from '@/lib/site'

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
      <PageHero
        kicker="Mt Washington Info"
        title="Discover Mount Washington."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped Mount Washington above the forest',
          position: 'center 35%',
        }}
      >
        <p>
          Your complete guide to Mount Washington. Explore local tips,
          activities, and insider knowledge to make the most of your mountain
          getaway.
        </p>
      </PageHero>

      {/* Categories Section */}
      <Band tone="white">
        <Container>
          <SectionHead
            kicker="Browse by topic"
            title="Find what you’re looking for."
          >
            <p>
              Whether you&apos;re planning a ski trip, summer adventure, or family
              vacation, we&apos;ve got you covered with expert local knowledge.
            </p>
          </SectionHead>

          <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const meta = categoryMetadata[cat.slug]
              return (
                <FadeIn
                  key={cat.slug}
                  className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40"
                >
                  <CardIcon src={cat.icon} size="sm" />
                  <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                    <Link
                      href={`/mount-washington/category/${cat.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {meta.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-auto text-base/[1.6] text-muted">
                    {meta.description}
                  </p>
                  <p
                    aria-hidden="true"
                    className="mt-6 text-[0.9375rem] font-medium text-accent"
                  >
                    View guides →
                  </p>
                </FadeIn>
              )
            })}
          </FadeInStagger>
        </Container>
      </Band>

      {/* Latest Guides Section */}
      {latestGuides.length > 0 && (
        <Band tone="white" className="pt-0 split:pt-0">
          <Container>
            <SectionHead kicker="Recent guides" title="Latest from the mountain.">
              <p>
                Stay up to date with the latest tips, seasonal updates, and
                insider recommendations for your Mount Washington visit.
              </p>
            </SectionHead>

            <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2 lg:grid-cols-3">
              {latestGuides.map((guide) => (
                <FadeIn
                  key={guide.slug}
                  className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40"
                >
                  <div className="flex items-center gap-2.5 text-sm text-muted">
                    <time dateTime={guide.publishedAt}>
                      {formatDate(guide.publishedAt)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>
                      {categoryMetadata[guide.category]?.title ?? guide.category}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[1.375rem]/[1.3] font-semibold tracking-[-0.02em] text-ink">
                    <Link
                      href={`/mount-washington/${guide.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-auto text-base/[1.6] text-muted">
                    {guide.description}
                  </p>
                  <p
                    aria-hidden="true"
                    className="mt-6 text-[0.9375rem] font-medium text-accent"
                  >
                    Read more →
                  </p>
                </FadeIn>
              ))}
            </FadeInStagger>
          </Container>
        </Band>
      )}

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
