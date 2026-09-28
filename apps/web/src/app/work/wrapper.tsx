import Image from 'next/image'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { MDXComponents } from '@/components/MDXComponents'
import { PageHero } from '@/components/PageHero'
import { PageLinks } from '@/components/PageLinks'
import { RootLayout } from '@/components/RootLayout'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

export default async function CaseStudyLayout({
  caseStudy,
  children,
}: {
  caseStudy: MDXEntry<CaseStudy>
  children: React.ReactNode
}) {
  let allCaseStudies = await loadCaseStudies()
  let moreCaseStudies = allCaseStudies
    .filter(({ metadata }) => metadata !== caseStudy)
    .slice(0, 2)
  let year = caseStudy.date.split('-')[0]

  return (
    <RootLayout>
      <article>
        <PageHero kicker="Case Study" title={caseStudy.title}>
          <p>{caseStudy.description}</p>
        </PageHero>

        <Band tone="cream">
          <Container>
            <FadeIn>
              <dl className="grid gap-3 split:grid-cols-3">
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Client
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {caseStudy.client}
                  </dd>
                </div>
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Year
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    <time dateTime={year}>{year}</time>
                  </dd>
                </div>
                <div className="rounded-[2rem] bg-sand px-6 py-4">
                  <dt className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                    Service
                  </dt>
                  <dd className="mt-1 text-lg font-semibold">
                    {caseStudy.service}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 overflow-hidden rounded-[2.75rem] bg-sand">
                <Image
                  alt=""
                  {...caseStudy.image}
                  sizes="(min-width: 75rem) 72rem, calc(100vw - 3rem)"
                  preload
                  className="w-full photo-warm"
                />
              </div>
            </FadeIn>
            <FadeIn className="mt-20">
              <MDXComponents.wrapper>{children}</MDXComponents.wrapper>
            </FadeIn>
          </Container>
        </Band>
      </article>

      {moreCaseStudies.length > 0 && (
        <PageLinks title="More case studies" pages={moreCaseStudies} />
      )}

      <ContactSection />
    </RootLayout>
  )
}
