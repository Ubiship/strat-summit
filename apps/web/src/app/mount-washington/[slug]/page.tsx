import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import remarkGfm from 'remark-gfm'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { categoryMetadata, getAllGuides, getGuideBySlug } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

type Props = {
  params: Promise<{ slug: string }>
}

// MDX components for styling
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="type-display mt-14 text-[clamp(2.25rem,4vw,3rem)] text-balance first:mt-0"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-14 text-[clamp(1.75rem,3vw,2.25rem)]/[1.15] font-semibold tracking-[-0.03em] text-balance first:mt-0"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-10 text-[1.375rem]/[1.3] font-semibold tracking-[-0.02em] first:mt-0"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-6 text-[1.125rem]/[1.7] text-ink/85 first:mt-0" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-6 space-y-3 text-[1.125rem]/[1.7] text-ink/85" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-6 space-y-3 text-[1.125rem]/[1.7] text-ink/85" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-6 list-disc pl-2 marker:text-accent" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-8 border-l-2 border-accent pl-6 text-[1.1875rem]/[1.6] text-muted"
      {...props}
    />
  ),
  hr: () => <hr className="my-14 border-t border-line" />,
}

export async function generateStaticParams() {
  const guides = await getAllGuides()
  return guides.map((guide) => ({
    slug: guide.slug,
  }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const guide = await getGuideBySlug(params.slug)

  if (!guide) {
    return {
      title: 'Guide Not Found',
    }
  }

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default async function GuidePage(props: Props) {
  const params = await props.params
  const guide = await getGuideBySlug(params.slug)

  if (!guide) {
    notFound()
  }

  const categoryMeta = categoryMetadata[guide.category]

  if (!categoryMeta) {
    console.error(`Category metadata not found for category: ${guide.category}`)
    notFound()
  }

  return (
    <RootLayout>
      {/* Header */}
      <section className="bg-white pt-20 split:pt-28">
        <Container>
          <FadeIn className="mx-auto max-w-3xl">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2.5 text-[0.9375rem] font-medium text-muted"
            >
              <Link
                href="/mount-washington"
                className="text-accent transition hover:text-accent-deep"
              >
                Mt Washington Info
              </Link>
              <span aria-hidden="true" className="text-line">
                /
              </span>
              <Link
                href={`/mount-washington/category/${guide.category}`}
                className="text-accent transition hover:text-accent-deep"
              >
                {categoryMeta.title}
              </Link>
            </nav>
            <h1 className="mt-6 type-display text-[clamp(2.75rem,6vw,4.75rem)] text-balance">
              {guide.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[0.9375rem] text-muted">
              {guide.publishedAt && (
                <>
                  <time dateTime={guide.publishedAt}>
                    {formatDate(guide.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{guide.author}</span>
            </div>
            <hr className="mt-12 border-t border-line" />
          </FadeIn>
        </Container>
      </section>

      {/* Content */}
      <Band tone="white" className="pt-12 split:pt-16">
        <Container>
          <FadeIn className="mx-auto max-w-3xl">
            <div className="text-ink">
              <MDXRemote
                source={guide.content}
                components={components}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            </div>
            <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-[0.9375rem] font-medium">
              <Link
                href={`/mount-washington/category/${guide.category}`}
                className="inline-flex items-center gap-2 text-accent transition hover:text-accent-deep"
              >
                <span aria-hidden="true">←</span>
                More in {categoryMeta.title}
              </Link>
              <Link
                href="/mount-washington"
                className="text-muted transition hover:text-ink"
              >
                All Mt Washington Info
              </Link>
            </div>
          </FadeIn>
        </Container>
      </Band>

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
