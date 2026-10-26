import { type Metadata } from 'next'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { ContactSection } from '@/components/ContactSection'
import { cardClasses } from '@/components/Card'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { SansAmpersand } from '@/components/SansAmpersand'
import iconDeepCleaning from '@/images/icons/icon-deep-cleaning.png'
import iconLinenService from '@/images/icons/icon-linen-service.png'
import iconRestocking from '@/images/icons/icon-restocking.png'
import iconTurnoverCleaning from '@/images/icons/icon-turnover-cleaning.png'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Professional Cleaning Services',
  description:
    'Professional cleaning for vacation properties on Vancouver Island — turnover cleaning, deep cleaning, linen service, and restocking.',
}

const services = [
  {
    title: 'Turnover cleaning',
    icon: iconTurnoverCleaning,
    description:
      'Complete property reset between guests — kitchen, bathrooms, bedrooms, and common areas cleaned to guest-ready standard.',
    tone: 'outline' as const,
  },
  {
    title: 'Deep cleaning',
    icon: iconDeepCleaning,
    description:
      'Seasonal deep cleans for baseboards, windows, appliances, and high-touch surfaces that need attention beyond regular turnovers.',
    tone: 'tint' as const,
  },
  {
    title: 'Linen service',
    icon: iconLinenService,
    description:
      'Fresh bed linens and towels for every stay — washed, pressed, and restocked so you never have to think about laundry logistics.',
    tone: 'tint' as const,
  },
  {
    title: 'Restocking',
    icon: iconRestocking,
    description:
      'Supplies replenished before each arrival — coffee, paper products, cleaning essentials, and amenities tailored to your property.',
    tone: 'outline' as const,
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

      <Band>
        <Container>
          <SectionHead kicker="Services" title="What we offer">
            <p>
              From scheduled turnovers to seasonal deep cleans, our service
              packages are designed around how vacation properties actually
              operate — not generic residential cleaning templates.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-16 grid gap-6 split:grid-cols-2">
            {services.map((service) => (
              <FadeIn
                key={service.title}
                className={clsx(
                  cardClasses({ tone: service.tone }),
                  'flex min-h-[18rem] flex-col p-8 split:p-10',
                )}
              >
                <CardIcon src={service.icon} />
                <h3 className="mt-auto pt-10 type-display text-[clamp(2.25rem,3.2vw,2.875rem)]">
                  {service.title}
                </h3>
                <p className="mt-4 text-[1.0625rem]/[1.55] opacity-90">
                  {service.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band>
        <Container>
          <SectionHead kicker="How it works" title="Three steps to guest-ready">
            <p>
              Whether you manage one property or a full portfolio, our workflow
              stays consistent — reliable turnaround times and clear
              communication from booking to completion.
            </p>
          </SectionHead>
          <FadeInStagger className="relative mt-16">
            <FadeIn
              aria-hidden="true"
              className="absolute top-[calc(2rem-0.125rem)] right-[calc((100%-6rem)/6)] left-[calc((100%-6rem)/6)] hidden h-1 rounded-full bg-warm-ink/25 split:block"
            />
            <ol
              role="list"
              className="relative grid gap-12 split:grid-cols-3 split:gap-8"
            >
              {steps.map((step, index) => (
                <li key={step.title}>
                  <FadeIn className="flex gap-6 split:flex-col split:items-center split:text-center">
                    <NumberBadge
                      value={index + 1}
                      tone="forest"
                      size="lg"
                      className="relative"
                    />
                    <div>
                      <h2 className="type-display text-[2.625rem]">
                        <SansAmpersand>{step.title}</SansAmpersand>
                      </h2>
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

      <ContactSection />
    </RootLayout>
  )
}
