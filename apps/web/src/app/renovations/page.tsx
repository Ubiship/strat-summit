import { type Metadata } from 'next'
import Image from 'next/image'

import { Quote } from 'lucide-react'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
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
    description: 'We agree on the scope, costs, and timing before work begins.',
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

function ProcessSteps({
  steps,
}: {
  steps: { title: string; description: string }[]
}) {
  return (
    <FadeInStagger>
      <ol
        role="list"
        className="mt-14 grid gap-12 split:mt-20 split:grid-cols-4 split:gap-8"
      >
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-[4.5rem] -bottom-8 left-7 w-px bg-line split:top-7 split:right-[-1rem] split:bottom-auto split:left-[4.5rem] split:h-px split:w-auto"
              />
            )}
            <FadeIn className="flex gap-6 split:flex-col split:gap-8">
              <NumberBadge value={index + 1} size="lg" />
              <div className="pt-3 split:pt-0">
                <h3 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-base/[1.6] text-muted">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          </li>
        ))}
      </ol>
    </FadeInStagger>
  )
}

export default function Renovations() {
  return (
    <RootLayout>
      <PageHero
        kicker="Renovations on Mount Washington"
        title="Thoughtful updates for your mountain home."
        size="short"
        image={{
          src: site.images.renovations,
          alt: 'Interior renovation framing and construction in progress',
          position: 'center 55%',
        }}
        actions={
          <Button href="/contact" arrow>
            Enquire about a project
          </Button>
        }
      >
        <p>
          Joel takes on a limited number of renovation projects, drawing on his
          construction background and experience living and working on Mount
          Washington. He enjoys helping owners make their spaces work better,
          with a clear understanding of the work involved.
        </p>
        <p>
          Most projects are planned for spring through fall, around the
          mountain&apos;s busy ski season.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <FadeIn className="grid gap-10 split:grid-cols-[0.9fr_1.1fr] split:gap-20">
            <div>
              <Kicker>Joel&apos;s approach</Kicker>
              <h2 className="mt-4 type-display text-[clamp(2.5rem,5vw,4rem)] text-balance text-ink">
                Good work starts with the right fit.
              </h2>
            </div>
            <div className="space-y-5 text-[1.125rem]/[1.7] text-muted split:pt-2">
              <p>
                Renovations are something Joel enjoys, and we keep this part of
                the business small. He takes on projects that suit his skills,
                interests, and availability, with time to give each one the
                attention it needs.
              </p>
              <p>
                Living on the mountain, we know finding someone to take on your
                project can be a challenge. We&apos;re happy to talk through
                what you have in mind and see whether it&apos;s a good fit.
              </p>
            </div>
          </FadeIn>
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="border-t border-line pt-24 split:pt-36">
            <SectionHead
              kicker="Process"
              title="From estimate to walkthrough."
            />
            <ProcessSteps steps={steps} />
          </div>
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="grid items-center gap-12 border-t border-line pt-24 split:grid-cols-[0.85fr_1.15fr] split:gap-20 split:pt-36">
            <FadeIn className="rounded-[2rem] border border-line bg-white p-2.5">
              <div className="relative aspect-4/5 overflow-hidden rounded-[1.5rem]">
                <Image
                  src={site.images.renovations}
                  alt=""
                  fill
                  sizes="(min-width: 75rem) 29rem, (min-width: 56.25rem) 38vw, 100vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn>
              <figure>
                <Quote
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-8 text-accent"
                />
                <blockquote className="mt-6 text-[clamp(1.75rem,3.2vw,2.625rem)]/[1.18] font-semibold tracking-[-0.03em] text-balance text-ink">
                  <p>
                    We would rather set expectations early than surprise you
                    mid-project — clear scope up front keeps everyone aligned.
                  </p>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-3 text-base">
                  <span aria-hidden="true" className="h-px w-8 bg-line" />
                  <span className="font-semibold text-ink">Joel</span>
                  <span className="text-muted">Co-founder</span>
                </figcaption>
              </figure>
            </FadeIn>
          </div>
        </Container>
      </Band>

      <PropertiesCta
        audience="owners"
        title="Planning a project for next season?"
        description="Winter is a good time to get in touch about spring, summer, or fall renovations. Joel's availability is limited, so an early conversation gives us time to discuss your plans and see how they might fit into the calendar."
        primaryLabel="Enquire about a project"
        secondaryAction={null}
      />
    </RootLayout>
  )
}
