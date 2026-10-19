import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { PropertiesCta } from '@/components/PropertiesCta'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { formatDate } from '@/lib/formatDate'
import { loadArticles } from '@/lib/mdx'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stay up-to-date with the latest industry news as our marketing teams finds new ways to re-purpose old CSS tricks articles.',
}

export default async function Blog() {
  let articles = await loadArticles()

  return (
    <RootLayout>
      <PageHero kicker="Blog" title="The latest articles and news">
        <p>
          Stay up-to-date with the latest industry news as our marketing teams
          finds new ways to re-purpose old CSS tricks articles.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <FadeInStagger className="mx-auto grid max-w-4xl gap-5">
            {articles.map((article) => (
              <FadeIn key={article.href}>
                <article className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10">
                  <h2 className="text-[clamp(1.625rem,2.5vw,2rem)]/[1.2] font-semibold tracking-[-0.025em] text-balance">
                    <Link
                      href={article.href}
                      className="transition hover:text-accent"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
                    <dt className="sr-only">Published</dt>
                    <dd>
                      <time dateTime={article.date}>
                        {formatDate(article.date)}
                      </time>
                    </dd>
                    <dt className="sr-only">Author</dt>
                    <dd className="flex items-center gap-3">
                      <Image
                        alt=""
                        {...article.author.image}
                        sizes="2.75rem"
                        className="size-11 rounded-full object-cover"
                      />
                      <span>
                        <span className="font-semibold text-ink">
                          {article.author.name}
                        </span>
                        , {article.author.role}
                      </span>
                    </dd>
                  </dl>
                  <p className="mt-5 max-w-2xl text-base/[1.6] text-muted">
                    {article.description}
                  </p>
                  <Button
                    href={article.href}
                    size="sm"
                    aria-label={`Read more: ${article.title}`}
                    className="mt-7"
                  >
                    Read more
                  </Button>
                </article>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <PropertiesCta audience="owners" />
    </RootLayout>
  )
}
