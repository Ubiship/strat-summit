import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import { formatDate } from '@/lib/formatDate'

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 6" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3 18 .5v2H0v1h18v2L24 3Z"
      />
    </svg>
  )
}

interface Page {
  href: string
  date: string
  title: string
  description: string
}

function PageLink({ page }: { page: Page }) {
  return (
    <article className="relative flex h-full flex-col items-start rounded-[2.5rem] bg-warm-cream p-8">
      <h3 className="mt-4 type-display text-3xl">{page.title}</h3>
      <time
        dateTime={page.date}
        className="order-first text-sm font-semibold text-warm-muted"
      >
        {formatDate(page.date)}
      </time>
      <p className="mt-3 text-base/[1.55] text-warm-muted">
        {page.description}
      </p>
      <Link
        href={page.href}
        className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-sun px-4.5 py-3 text-[0.9375rem] font-bold text-warm-ink transition hover:bg-sun-light focus-visible:-outline-offset-4"
        aria-label={`Read more: ${page.title}`}
      >
        Read more
        <ArrowIcon className="w-6 flex-none fill-current" />
        <span className="absolute inset-0 rounded-[2.5rem]" />
      </Link>
    </article>
  )
}

export function PageLinks({
  title,
  pages,
}: {
  title: string
  pages: Array<Page>
}) {
  return (
    <Band tone="sand">
      <Container>
        <SectionHead title={title} />
        <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-2">
          {pages.map((page) => (
            <FadeIn key={page.href}>
              <PageLink page={page} />
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}
