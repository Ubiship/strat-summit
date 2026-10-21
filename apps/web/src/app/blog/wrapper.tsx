import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { MDXComponents } from '@/components/MDXComponents'
import { PageHero } from '@/components/PageHero'
import { PageLinks } from '@/components/PageLinks'
import { RootLayout } from '@/components/RootLayout'
import { formatDate } from '@/lib/formatDate'
import { type Article, type MDXEntry, loadArticles } from '@/lib/mdx'

export default async function BlogArticleWrapper({
  article,
  children,
}: {
  article: MDXEntry<Article>
  children: React.ReactNode
}) {
  let allArticles = await loadArticles()
  let moreArticles = allArticles
    .filter(({ metadata }) => metadata !== article)
    .slice(0, 2)

  return (
    <RootLayout>
      <article>
        <PageHero title={article.title}>
          <p>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
          </p>
          <p className="font-semibold">
            by {article.author.name}, {article.author.role}
          </p>
        </PageHero>

        <Band tone="cream">
          <Container>
            <FadeIn>
              <MDXComponents.wrapper>{children}</MDXComponents.wrapper>
            </FadeIn>
          </Container>
        </Band>
      </article>

      {moreArticles.length > 0 && (
        <PageLinks title="More articles" pages={moreArticles} />
      )}

      <ContactSection />
    </RootLayout>
  )
}
