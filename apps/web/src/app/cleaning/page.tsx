import { type Metadata } from 'next'
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
  title: 'Professional Cleaning Services',
  description:
    'Professional cleaning for vacation properties on Vancouver Island — turnover cleaning, deep cleaning, linen service, and restocking.',
}

const services = [
  {
    title: 'Turnover cleaning',
    description:
      'Complete property reset between guests — kitchen, bathrooms, bedrooms, and common areas cleaned to guest-ready standard.',
    tone: 'bg-warm-cream text-warm-ink',
  },
  {
    title: 'Deep cleaning',
    description:
      'Seasonal deep cleans for baseboards, windows, appliances, and high-touch surfaces that need attention beyond regular turnovers.',
    tone: 'bg-sand text-warm-ink',
  },
  {
    title: 'Linen service',
    description:
      'Fresh bed linens and towels for every stay — washed, pressed, and restocked so you never have to think about laundry logistics.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    title: 'Restocking',
    description:
      'Supplies replenished before each arrival — coffee, paper products, cleaning essentials, and amenities tailored to your property.',
    tone: 'bg-warm-cream text-warm-ink',
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

      <Band tone="cream">
        <Container>
          <SectionHead kicker="Services" title="What we offer">
            <p>
              From scheduled turnovers to seasonal deep cleans, our service
              packages are designed around how vacation properties actually
              operate — not generic residential cleaning templates.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-2">
            {services.map((service) => (
              <FadeIn
                key={service.title}
                className={clsx(
                  'flex min-h-[16rem] flex-col justify-end rounded-[2.75rem] p-8',
                  service.tone,
                )}
              >
                <h3 className="type-display text-[clamp(2.125rem,3.2vw,2.75rem)]">
                  {service.title}
                </h3>
                <p className="mt-3 text-base/[1.5] opacity-90">
                  {service.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="sand">
        <Container>
          <SectionHead kicker="How it works" title="Three steps to guest-ready">
            <p>
              Whether you manage one property or a full portfolio, our workflow
              stays consistent — reliable turnaround times and clear
              communication from booking to completion.
            </p>
          </SectionHead>
          <FadeInStagger className="relative mt-12">
            <FadeIn
              aria-hidden="true"
              className="absolute top-[calc(2rem-0.125rem)] right-[calc((100%-4.5rem)/6)] left-[calc((100%-4.5rem)/6)] hidden h-1 rounded-full bg-warm-ink/25 split:block"
            />
            <ol
              role="list"
              className="relative grid gap-10 split:grid-cols-3 split:gap-6"
            >
              {steps.map((step, index) => (
                <li key={step.title}>
                  <FadeIn className="flex gap-5 split:flex-col split:items-center split:text-center">
                    <NumberBadge
                      value={index + 1}
                      tone="ink"
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

      <ContactSection />
    </RootLayout>
  )
}
