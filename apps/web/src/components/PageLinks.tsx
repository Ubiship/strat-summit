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
    <article className="relative flex h-full flex-col items-start rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40">
      <h3 className="mt-3 text-[1.375rem] font-semibold tracking-[-0.02em]">
        {page.title}
      </h3>
      <time
        dateTime={page.date}
        className="order-first text-sm text-muted"
      >
        {formatDate(page.date)}
      </time>
      <p className="mt-2 text-base/[1.6] text-muted">
        {page.description}
      </p>
      <Link
        href={page.href}
        className="mt-6 inline-flex items-center gap-2.5 text-[0.9375rem] font-medium text-accent transition hover:text-accent-deep"
        aria-label={`Read more: ${page.title}`}
      >
        Read more
        <ArrowIcon className="w-6 flex-none fill-current" />
        <span className="absolute inset-0 rounded-[1.5rem]" />
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
    <Band tone="mist">
      <Container>
        <SectionHead title={title} />
        <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2">
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
