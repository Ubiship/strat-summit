import { type Metadata } from 'next'
import Image from 'next/image'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CtaPanel } from '@/components/CtaPanel'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Renovations on Mount Washington',
  description:
    'Thoughtful renovation updates for your Mount Washington home. Joel takes on a limited number of projects, planned for spring through fall.',
}

const steps = [
  {
    title: 'Estimate',
    description:
      'We discuss your project and provide an estimate based on the agreed scope.',
  },
  {
    title: 'Contract',
    description:
      'We agree on the scope, costs, and timing before work begins.',
  },
  {
    title: 'Build',
    description:
      'Joel keeps you updated as work progresses. Changes to the scope are discussed and documented through change orders.',
  },
  {
    title: 'Complete',
    description:
      'We complete a final walk-through with you before sending the final invoice.',
  },
]

export default function Renovations() {
  return (
    <RootLayout>
      {/* 1. OPENING SECTION */}
      <PageHero
        kicker="Renovations on Mount Washington"
        title="Thoughtful updates for your mountain home."
        size="short"
        image={{
          src: site.images.renovations,
          alt: 'Interior renovation framing and construction in progress',
          position: 'center 55%',
        }}
      >
        <p>
          Joel takes on a limited number of renovation projects, drawing on his
          construction background and experience living and working on Mount
          Washington. He enjoys helping owners make their spaces work better,
          with a clear understanding of the work involved.
        </p>
        <p className="mt-4">
          Most projects are planned for spring through fall, around the
          mountain's busy ski season.
        </p>
      </PageHero>

      <Band>
        <Container>
          <FadeIn className="text-center">
            <Button href="/contact" tone="forest" size="lg" arrow>
              Enquire About a Project
            </Button>
          </FadeIn>
        </Container>
      </Band>

      {/* 2. JOEL'S APPROACH */}
      <Band>
        <Container>
          <FadeIn className="mx-auto max-w-3xl">
            <h2 className="type-display text-center text-[clamp(2.5rem,4vw,3.5rem)] text-warm-ink">
              Good work starts with the right fit.
            </h2>
            <div className="mt-10 space-y-6 text-[1.125rem]/[1.7] text-warm-ink/80">
              <p>
                Renovations are something Joel enjoys, and we keep this part of
                the business small. He takes on projects that suit his skills,
                interests, and availability, with time to give each one the
                attention it needs.
              </p>
              <p>
                Living on the mountain, we know finding someone to take on your
                project can be a challenge. We're happy to talk through what you
                have in mind and see whether it's a good fit.
              </p>
            </div>
          </FadeIn>

          {/* A three-up grid of project photos goes here once the client
              supplies them; empty labelled boxes read as unfinished. */}
        </Container>
      </Band>

      {/* 3. NUMBERED PROCESS */}
      <Band>
        <Container>
          <FadeInStagger className="relative">
            <FadeIn
              aria-hidden="true"
              className="absolute top-[calc(2rem-0.125rem)] right-[calc((100%-6rem)/8)] left-[calc((100%-6rem)/8)] hidden h-1 rounded-full bg-forest-warm/15 split:block"
            />
            <ol
              role="list"
              className="relative grid gap-12 split:grid-cols-4 split:gap-8"
            >
              {steps.map((step, index) => (
                <li key={step.title}>
                  <FadeIn className="flex gap-6 split:flex-col split:items-center split:text-center">
                    <NumberBadge
                      value={index + 1}
                      size="lg"
                      className="relative"
                    />
                    <div>
                      <h2 className="type-display text-[2.625rem]">{step.title}</h2>
                      <p className="mt-4 text-[1.0625rem]/[1.6] text-warm-muted">
                        {step.description}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ol>
          </FadeInStagger>
        </Container>
      </Band>

      {/* 4. JOEL'S QUOTE */}
      <Band>
        <Container className="grid items-center gap-12 split:grid-cols-[0.8fr_1.2fr] split:gap-20">
          <FadeIn className="relative aspect-4/5 overflow-hidden rounded-[2.75rem]">
            <Image
              src={site.images.renovations}
              alt=""
              fill
              sizes="(min-width: 75rem) 27.25rem, (min-width: 56.25rem) 36vw, 100vw"
              className="object-cover photo-grade"
            />
          </FadeIn>
          <FadeIn>
            <figure>
              <blockquote className="type-display text-[clamp(2.25rem,4vw,3.5rem)] text-balance">
                <p>
                  <span aria-hidden="true">"</span>We would rather set
                  expectations early than surprise you mid-project — clear scope
                  up front keeps everyone aligned.
                  <span aria-hidden="true">"</span>
                </p>
              </blockquote>
              <figcaption className="mt-8 text-lg font-bold">
                Joel, Co-founder
              </figcaption>
            </figure>
          </FadeIn>
        </Container>
      </Band>

      {/* 5. ENQUIRY SECTION */}
      <CtaPanel
        title="Planning a project for next season?"
        actions={
          <Button href="/contact" tone="forest" size="lg" arrow>
            Enquire About a Project
          </Button>
        }
      >
        <p>
          Winter is a good time to get in touch about spring, summer, or fall
          renovations. Joel&apos;s availability is limited, so an early conversation
          gives us time to discuss your plans and see how they might fit into
          the calendar.
        </p>
      </CtaPanel>
    </RootLayout>
  )
}
