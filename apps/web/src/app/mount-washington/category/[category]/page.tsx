import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import {
  categoryMetadata,
  getCategories,
  getGuidesByCategory,
  type GuideCategory,
} from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import { site } from '@/lib/site'

type Props = {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    category,
  }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const category = params.category as GuideCategory

  const meta = categoryMetadata[category]
  if (!meta) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: meta.title,
    description: meta.description,
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  const category = params.category as GuideCategory

  const meta = categoryMetadata[category]
  if (!meta) {
    notFound()
  }

  const guides = await getGuidesByCategory(category)

  return (
    <RootLayout>
      <PageHero
        size="short"
        kicker="Mt Washington Info"
        title={meta.title}
        image={{
          src: site.images.hero,
          alt: 'Snow-capped Mount Washington above the forest',
          position: 'center 35%',
        }}
        actions={
          <Link
            href="/mount-washington"
            className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-accent transition hover:text-accent-deep"
          >
            <span aria-hidden="true">←</span>
            All topics
          </Link>
        }
      >
        <p>{meta.description}</p>
      </PageHero>

      {/* Guides List */}
      <Band tone="white">
        <Container>
          {guides.length === 0 ? (
            <FadeIn className="py-12 text-center">
              <p className="text-[1.1875rem] text-muted">
                No guides available in this category yet. Check back soon for
                new content!
              </p>
            </FadeIn>
          ) : (
            <>
              <SectionHead
                kicker={`${guides.length} guide${guides.length !== 1 ? 's' : ''}`}
                title="Local knowledge, written down."
              >
                <p>
                  Explore our curated collection of guides to help you make the
                  most of your Mount Washington experience.
                </p>
              </SectionHead>

              <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => (
                  <FadeIn
                    key={guide.slug}
                    className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40"
                  >
                    <div className="flex items-center gap-2.5 text-sm text-muted">
                      <time dateTime={guide.publishedAt}>
                        {formatDate(guide.publishedAt)}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{guide.author}</span>
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
                      Read guide →
                    </p>
                  </FadeIn>
                ))}
              </FadeInStagger>
            </>
          )}
        </Container>
      </Band>

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
