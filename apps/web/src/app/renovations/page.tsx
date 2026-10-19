import { type Metadata } from 'next'
import Image from 'next/image'

import { Fence, HardHat, House, Quote, ShowerHead } from 'lucide-react'

import { Band } from '@/components/Band'
import { PropertiesCta } from '@/components/PropertiesCta'
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
    icon: ShowerHead,
    description:
      'Layout updates, cabinetry, tile, fixtures, and ventilation — the rooms guests and owners notice first.',
  },
  {
    title: 'Decks & exteriors',
    icon: Fence,
    description:
      'Weather-ready materials suited for coastal conditions and strata requirements where applicable.',
  },
  {
    title: 'Whole-home refresh',
    icon: House,
    description:
      'Flooring, paint, trim, and lighting packages to reset a property between seasons or before sale.',
  },
  {
    title: 'Subtrade coordination',
    icon: HardHat,
    description:
      'Licensed trades brought in as needed — one point of contact for the owner.',
  },
]

// Numbered steps joined by a hairline: across on wide screens, down the
// badges on narrow ones.
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

      <Band tone="white">
        <Container>
          <SectionHead kicker="Process" title="From estimate to walkthrough." />
          <ProcessSteps steps={steps} />
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="border-t border-line pt-24 split:pt-36">
            <SectionHead
              kicker="Project types"
              title="What we typically take on."
            >
              <p>
                Renovation demand peaks in summer — we plan capacity so your
                project gets focused attention during the window that works for
                Island properties.
              </p>
            </SectionHead>
            <FadeInStagger className="mt-14 grid gap-5 split:mt-20 split:grid-cols-2">
              {projectTypes.map(({ title, description, icon: Icon }) => (
                <FadeIn
                  key={title}
                  className="flex flex-col rounded-[1.5rem] border border-line bg-white p-8 split:p-10"
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-7 text-accent"
                  />
                  <h3 className="mt-8 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-md text-base/[1.6] text-muted">
                    {description}
                  </p>
                </FadeIn>
              ))}
            </FadeInStagger>
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

      <PropertiesCta audience="owners" />
    </RootLayout>
  )
}
