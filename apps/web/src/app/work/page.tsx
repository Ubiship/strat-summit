import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { Blockquote } from '@/components/Blockquote'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { Testimonial } from '@/components/Testimonial'
import logoBrightPath from '@/images/clients/bright-path/logo-dark.svg'
import logoFamilyFund from '@/images/clients/family-fund/logo-dark.svg'
import logoGreenLife from '@/images/clients/green-life/logo-dark.svg'
import logoHomeWork from '@/images/clients/home-work/logo-dark.svg'
import logoMailSmirk from '@/images/clients/mail-smirk/logo-dark.svg'
import logoNorthAdventures from '@/images/clients/north-adventures/logo-dark.svg'
import logoPhobia from '@/images/clients/phobia/logo-dark.svg'
import logoUnseal from '@/images/clients/unseal/logo-dark.svg'
import { formatDate } from '@/lib/formatDate'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'

function CaseStudies({
  caseStudies,
}: {
  caseStudies: Array<MDXEntry<CaseStudy>>
}) {
  return (
    <Band tone="cream">
      <Container>
        <FadeIn>
          <h2 className="type-display text-[clamp(3.25rem,6vw,5.5rem)]">
            Case studies
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-4.5">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.client}>
              <article className="grid gap-8 rounded-[2.75rem] bg-sand p-8 split:grid-cols-[16rem_1fr] split:p-10">
                <div>
                  <Image
                    src={caseStudy.logo}
                    alt=""
                    className="size-16"
                    unoptimized
                  />
                  <h3 className="mt-5 text-lg font-bold">{caseStudy.client}</h3>
                  <p className="mt-1 text-sm text-warm-muted">
                    {caseStudy.service}
                  </p>
                  <p className="mt-1 text-sm text-warm-muted">
                    <time dateTime={caseStudy.date}>
                      {formatDate(caseStudy.date)}
                    </time>
                  </p>
                </div>
                <div className="max-w-2xl">
                  <p className="type-display text-[clamp(2.25rem,3.6vw,3.25rem)]">
                    <Link
                      href={caseStudy.href}
                      className="transition hover:text-ember-deep"
                    >
                      {caseStudy.title}
                    </Link>
                  </p>
                  <div className="mt-5 space-y-5 text-base/[1.6] text-warm-muted">
                    {caseStudy.summary.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <Button
                    href={caseStudy.href}
                    size="sm"
                    aria-label={`Read case study: ${caseStudy.client}`}
                    className="mt-7"
                  >
                    Read case study
                  </Button>
                  {caseStudy.testimonial && (
                    <Blockquote
                      author={caseStudy.testimonial.author}
                      className="mt-10"
                    >
                      {caseStudy.testimonial.content}
                    </Blockquote>
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Band>
  )
}

const clients = [
  ['Phobia', logoPhobia],
  ['Family Fund', logoFamilyFund],
  ['Unseal', logoUnseal],
  ['Mail Smirk', logoMailSmirk],
  ['Home Work', logoHomeWork],
  ['Green Life', logoGreenLife],
  ['Bright Path', logoBrightPath],
  ['North Adventures', logoNorthAdventures],
]

function Clients() {
  return (
    <Band tone="sand">
      <Container>
        <FadeIn>
          <h2 className="type-display text-[clamp(3.25rem,6vw,5.5rem)]">
            You’re in good company
          </h2>
        </FadeIn>
        <FadeInStagger faster>
          <ul
            role="list"
            className="mt-10 grid grid-cols-2 gap-3 split:grid-cols-4"
          >
            {clients.map(([client, logo]) => (
              <li key={client}>
                <FadeIn className="grid h-28 place-items-center rounded-[2rem] bg-warm-cream px-6">
                  <Image src={logo} alt={client} unoptimized />
                </FadeIn>
              </li>
            ))}
          </ul>
        </FadeInStagger>
      </Container>
    </Band>
  )
}

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'We believe in efficiency and maximizing our resources to provide the best value to our clients.',
}

export default async function Work() {
  let caseStudies = await loadCaseStudies()

  return (
    <RootLayout>
      <PageHero
        kicker="Our work"
        title="Proven solutions for real-world problems."
      >
        <p>
          We believe in efficiency and maximizing our resources to provide the
          best value to our clients. The primary way we do that is by re-using
          the same five projects we’ve been developing for the past decade.
        </p>
      </PageHero>

      <CaseStudies caseStudies={caseStudies} />

      <Testimonial client={{ name: 'Mail Smirk', logo: logoMailSmirk }}>
        We approached <em>Studio</em> because we loved their past work. They
        delivered something remarkably similar in record time.
      </Testimonial>

      <Clients />

      <ContactSection />
    </RootLayout>
  )
}
