import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import remarkGfm from 'remark-gfm'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
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
      className="type-display mt-12 text-[clamp(2.5rem,5vw,3.5rem)] first:mt-0"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="type-display mt-10 text-[clamp(2rem,4vw,2.75rem)] first:mt-0"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 text-[1.5rem] font-bold first:mt-0" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-6 text-[1.0625rem]/[1.7] first:mt-0" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-6 space-y-3 text-[1.0625rem]/[1.7]" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-6 space-y-3 text-[1.0625rem]/[1.7]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-6 list-disc pl-2" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-warm-ink" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="font-semibold text-forest-warm underline decoration-forest-warm/30 underline-offset-4 transition hover:decoration-forest-warm"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-4 border-forest-warm pl-6 italic text-warm-muted"
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-t border-warm-muted/20" />,
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

  return (
    <RootLayout>
      {/* Header */}
      <Band tone="forest">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-[0.9375rem] font-bold text-warm-cream/80">
                <Link
                  href="/mount-washington"
                  className="transition hover:text-warm-cream"
                >
                  Mount Washington
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  href={`/mount-washington/category/${guide.category}`}
                  className="transition hover:text-warm-cream"
                >
                  {categoryMeta.title}
                </Link>
              </div>
              <h1 className="mt-6 type-display text-[clamp(3rem,7vw,5rem)] text-warm-cream">
                {guide.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.9375rem] text-[#f1dfc6]">
                <time dateTime={guide.publishedAt}>
                  {formatDate(guide.publishedAt)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{guide.author}</span>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Band>

      {/* Content */}
      <Band tone="sand">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <div className="prose prose-lg text-warm-ink">
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
            </div>
          </FadeIn>
        </Container>
      </Band>

      {/* CTA Section */}
      <Band tone="apricot" last>
        <Container>
          <FadeIn className="mx-auto max-w-3xl text-center">
            <h2 className="type-display text-[clamp(2.5rem,5vw,4rem)] text-warm-ink">
              Book your Mount Washington stay
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[1.1875rem]/[1.5] text-warm-muted">
              Experience everything Mount Washington has to offer from the
              comfort of one of our premium vacation rentals. Book direct for
              the best rates.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/stays" tone="forest" arrow>
                Browse Properties
              </Button>
              <Button href="/mount-washington" tone="cream">
                More Guides
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
