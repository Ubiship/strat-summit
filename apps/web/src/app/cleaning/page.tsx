import { type Metadata } from 'next'

import { BedDouble, PackageCheck, Sparkles, SprayCan } from 'lucide-react'

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
  title: 'Professional Cleaning Services',
  description:
    'Professional cleaning for vacation properties on Vancouver Island — turnover cleaning, deep cleaning, linen service, and restocking.',
}

const services = [
  {
    title: 'Turnover cleaning',
    icon: Sparkles,
    description:
      'Complete property reset between guests — kitchen, bathrooms, bedrooms, and common areas cleaned to guest-ready standard.',
  },
  {
    title: 'Deep cleaning',
    icon: SprayCan,
    description:
      'Seasonal deep cleans for baseboards, windows, appliances, and high-touch surfaces that need attention beyond regular turnovers.',
  },
  {
    title: 'Linen service',
    icon: BedDouble,
    description:
      'Fresh bed linens and towels for every stay — washed, pressed, and restocked so you never have to think about laundry logistics.',
  },
  {
    title: 'Restocking',
    icon: PackageCheck,
    description:
      'Supplies replenished before each arrival — coffee, paper products, cleaning essentials, and amenities tailored to your property.',
  },
]

const steps = [
  {
    title: 'Book your service',
    description:
      'Send us your property details and turnover schedule — one-off cleans or recurring calendar sync.',
  },
  {
    title: 'We clean & document',
    description:
      'Checklists completed, issues flagged, and photo confirmation sent after every visit.',
  },
  {
    title: 'Guests arrive guest-ready',
    description:
      'Property reset to standard, ready for check-in — no surprises, no missed details.',
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
        className="mt-14 grid gap-12 split:mt-20 split:grid-cols-3 split:gap-8"
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
                <p className="mt-2 max-w-sm text-base/[1.6] text-muted">
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

export default function Cleaning() {
  return (
    <RootLayout>
      <PageHero
        kicker="Cleaning"
        title="Professional cleaning for vacation properties."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
      >
        <p>
          Turnover cleaning built for vacation rentals — consistent standards,
          photo records, and flexible scheduling so your property is always
          guest-ready.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <SectionHead kicker="Services" title="What we offer.">
            <p>
              From scheduled turnovers to seasonal deep cleans, our service
              packages are designed around how vacation properties actually
              operate — not generic residential cleaning templates.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-14 grid gap-5 split:mt-20 split:grid-cols-2">
            {services.map(({ title, description, icon: Icon }) => (
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
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="border-t border-line pt-24 split:pt-36">
            <SectionHead
              kicker="How it works"
              title="Three steps to guest-ready."
            >
              <p>
                Whether you manage one property or a full portfolio, our
                workflow stays consistent — reliable turnaround times and clear
                communication from booking to completion.
              </p>
            </SectionHead>
            <ProcessSteps steps={steps} />
          </div>
        </Container>
      </Band>

      <PropertiesCta audience="owners" />
    </RootLayout>
  )
}
