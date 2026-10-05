import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import {
  categoryMetadata,
  getCategories,
  getGuidesByCategory,
  type GuideCategory,
} from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

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
      {/* Hero Section */}
      <Band tone="forest">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <Link
                href="/mount-washington"
                className="inline-flex items-center gap-2 text-[0.9375rem] font-bold text-warm-cream/80 transition hover:text-warm-cream"
              >
                <span aria-hidden="true" className="text-base">
                  ←
                </span>
                Back to all guides
              </Link>
              <h1 className="mt-6 type-display text-[clamp(3.5rem,8vw,6rem)] text-warm-cream">
                {meta.title}
              </h1>
              <p className="mt-6 text-[1.25rem]/[1.6] text-[#f1dfc6]">
                {meta.description}
              </p>
            </div>
          </FadeIn>
        </Container>
      </Band>

      {/* Guides List */}
      <Band tone="sand">
        <Container>
          {guides.length === 0 ? (
            <FadeIn className="py-12 text-center">
              <p className="text-[1.1875rem] text-warm-muted">
                No guides available in this category yet. Check back soon for
                new content!
              </p>
            </FadeIn>
          ) : (
            <>
              <SectionHead title={`${guides.length} guide${guides.length !== 1 ? 's' : ''}`}>
                <p>
                  Explore our curated collection of guides to help you make the
                  most of your Mount Washington experience.
                </p>
              </SectionHead>

              <FadeInStagger className="mt-12 grid gap-8 split:grid-cols-2">
                {guides.map((guide) => (
                  <FadeIn
                    key={guide.slug}
                    className="group flex flex-col rounded-3xl bg-white p-8 shadow-[0_8px_24px_rgb(42_24_10/0.06)] transition hover:shadow-[0_12px_32px_rgb(42_24_10/0.12)]"
                  >
                    <div className="mb-3 flex items-center gap-3 text-sm text-warm-muted">
                      <time dateTime={guide.publishedAt}>
                        {formatDate(guide.publishedAt)}
                      </time>
                      <span>·</span>
                      <span>{guide.author}</span>
                    </div>
                    <h3 className="type-display text-[clamp(1.75rem,3vw,2.25rem)] text-warm-ink">
                      {guide.title}
                    </h3>
                    <p className="mt-4 flex-auto text-[1.0625rem]/[1.5] text-warm-muted">
                      {guide.description}
                    </p>
                    <Link
                      href={`/mount-washington/${guide.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-forest-warm transition hover:text-forest-deep"
                    >
                      Read guide
                      <span aria-hidden="true" className="text-base">
                        →
                      </span>
                    </Link>
                  </FadeIn>
                ))}
              </FadeInStagger>
            </>
          )}
        </Container>
      </Band>

      {/* CTA Section */}
      <Band tone="apricot" last>
        <Container>
          <FadeIn className="mx-auto max-w-3xl text-center">
            <h2 className="type-display text-[clamp(2.5rem,5vw,4rem)] text-warm-ink">
              Ready for your mountain adventure?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[1.1875rem]/[1.5] text-warm-muted">
              Browse our vacation rentals and start planning your perfect Mount
              Washington getaway.
            </p>
            <div className="mt-10">
              <Button href="/stays" tone="forest" arrow>
                View Properties
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
