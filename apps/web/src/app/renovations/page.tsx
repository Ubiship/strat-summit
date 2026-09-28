import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Renovations & Construction',
  description:
    'Renovation and construction services on Vancouver Island — estimates, contracts, and seasonal project delivery.',
}

const steps = [
  {
    title: 'Estimate',
    description:
      'Line-item breakdowns for materials, labour, and margin — no mystery allowances.',
  },
  {
    title: 'Contract',
    description:
      'Fixed-price, cost-plus, or time & materials — we match the agreement to how well-defined the scope is.',
  },
  {
    title: 'Build',
    description:
      'In-progress updates, change orders when scope shifts, and milestone billing tied to real progress.',
  },
  {
    title: 'Complete',
    description:
      'Final walkthrough, punch list, and documentation for your records.',
  },
]

const projectTypes = [
  {
    title: 'Kitchens & bathrooms',
    description:
      'Layout updates, cabinetry, tile, fixtures, and ventilation — the rooms guests and owners notice first.',
    tone: 'bg-warm-cream text-warm-ink',
  },
  {
    title: 'Decks & exteriors',
    description:
      'Weather-ready materials suited for coastal conditions and strata requirements where applicable.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    title: 'Whole-home refresh',
    description:
      'Flooring, paint, trim, and lighting packages to reset a property between seasons or before sale.',
    tone: 'bg-forest-warm text-warm-cream',
  },
  {
    title: 'Subtrade coordination',
    description:
      'Licensed trades brought in as needed — one point of contact for the owner.',
    tone: 'bg-warm-cream text-warm-ink',
  },
]

export default function Renovations() {
  return (
    <RootLayout>
      <PageHero
        kicker="Renovations"
        title="Seasonal construction with clear estimates and honest timelines."
        image={{
          src: site.images.renovations,
          alt: 'Interior renovation framing and construction in progress',
          position: 'center 55%',
        }}
      >
        <p>
          Summer-heavy renovation work across Vancouver Island — from kitchen
          refreshes to full interior updates. We walk you through scope, budget,
          and contract type before a single hammer swings.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container>
          <FadeInStagger className="relative">
            {/* Insets match the centres of the first and last columns
                (three gap-6 gaps = 4.5rem) and the size-16 badge centre. */}
            <FadeIn
              aria-hidden="true"
              className="absolute top-[calc(2rem-0.125rem)] right-[calc((100%-4.5rem)/8)] left-[calc((100%-4.5rem)/8)] hidden h-1 rounded-full bg-sun/40 split:block"
            />
            <ol
              role="list"
              className="relative grid gap-10 split:grid-cols-4 split:gap-6"
            >
              {steps.map((step, index) => (
                <li key={step.title}>
                  <FadeIn className="flex gap-5 split:flex-col split:items-center split:text-center">
                    <NumberBadge
                      value={index + 1}
                      tone="sun"
                      size="lg"
                      className="relative"
                    />
                    <div>
                      <h2 className="type-display text-4xl">{step.title}</h2>
                      <p className="mt-3 text-base/[1.55] text-warm-muted">
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

      <Band tone="sand">
        <Container>
          <SectionHead kicker="Project types" title="What we typically take on">
            <p>
              Renovation demand peaks in summer — we plan capacity so your
              project gets focused attention during the window that works for
              Island properties.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-2">
            {projectTypes.map((project) => (
              <FadeIn
                key={project.title}
                className={clsx(
                  'flex min-h-[16rem] flex-col justify-end rounded-[2.75rem] p-8',
                  project.tone,
                )}
              >
                <h3 className="type-display text-[clamp(2.125rem,3.2vw,2.75rem)]">
                  {project.title}
                </h3>
                <p className="mt-3 text-base/[1.5] opacity-90">
                  {project.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="apricot">
        <Container className="grid items-center gap-10 split:grid-cols-[0.8fr_1.2fr] split:gap-16">
          <FadeIn className="relative aspect-4/5 overflow-hidden rounded-[2.75rem]">
            <Image
              src={site.images.renovations}
              alt=""
              fill
              sizes="(min-width: 75rem) 27.25rem, (min-width: 56.25rem) 36vw, 100vw"
              className="object-cover photo-warm"
            />
          </FadeIn>
          <FadeIn>
            <figure>
              <blockquote className="type-display text-[clamp(2.25rem,4vw,3.5rem)] text-balance">
                <p>
                  <span aria-hidden="true">“</span>We would rather set
                  expectations early than surprise you mid-project — clear scope
                  up front keeps everyone aligned.
                  <span aria-hidden="true">”</span>
                </p>
              </blockquote>
              <figcaption className="mt-8 text-lg font-bold">
                Joel, Co-founder
              </figcaption>
            </figure>
          </FadeIn>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
