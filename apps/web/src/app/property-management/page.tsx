import { type Metadata } from 'next'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PhotoBand } from '@/components/PhotoBand'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Property Management & Cleaning',
  description:
    'Vacation rental cleaning, caretaking, and full property management on Vancouver Island.',
}

const tiers = [
  {
    label: 'Tier 1',
    title: 'Basic cleaning',
    description:
      'You send dates, we clean and reset the property. Ideal when you handle bookings and guest communication yourself.',
    tone: 'bg-sand text-warm-ink',
  },
  {
    label: 'Tier 2',
    title: 'Cleaning + caretaking',
    description:
      'Maintenance checks, restocking, and proactive care between guests. You stay in control of marketing and bookings.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    label: 'Tier 3',
    title: 'Full property management',
    description:
      'End-to-end operations: bookings coordination, owner statements, and the full payout workflow. Built for hands-off owners.',
    tone: 'bg-forest-warm text-warm-cream',
  },
]

const inclusions = [
  'Turnover cleaning & linen service',
  'Restocking & supplies',
  'Hot tub & exterior checks',
  'Photo documentation',
  'Maintenance flagging',
  'Direct booking intake (Tier 2+)',
]

const platformFeatures = [
  {
    title: 'Calendar sync',
    description:
      'iCal integration keeps cleaning jobs aligned with confirmed stays.',
  },
  {
    title: 'Guest-ready standard',
    description: 'Consistent checklists and photo records for every turnover.',
  },
  {
    title: 'Owner visibility',
    description:
      'Tier 3 owners get statements, breakdowns, and a dedicated portal as the platform rolls out.',
  },
]

export default function PropertyManagement() {
  return (
    <RootLayout>
      <PageHero
        kicker="Property management"
        title="Cleaning, caretaking, and full management for your property."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
      >
        <p>
          From scheduled turnover cleans to complete owner support, we offer
          three service tiers so you only pay for the level of involvement you
          need.
        </p>
      </PageHero>

      <Band tone="cream">
        <Container>
          <FadeInStagger className="grid gap-4.5 split:grid-cols-[1fr_1fr_1.35fr]">
            {tiers.map((tier) => (
              <FadeIn
                key={tier.label}
                className={clsx(
                  'flex min-h-[22rem] flex-col rounded-[2.75rem] p-8',
                  tier.tone,
                )}
              >
                <p className="text-sm font-bold tracking-[0.08em] uppercase">
                  {tier.label}
                </p>
                <h2 className="mt-auto pt-16 type-display text-[clamp(2.25rem,3.4vw,3rem)]">
                  {tier.title}
                </h2>
                <p className="mt-3 text-base/[1.5] opacity-90">
                  {tier.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="sand">
        <Container>
          <SectionHead kicker="Included" title="What every visit covers">
            <p>
              Our cleaning checklists are built from real turnover workflows —
              not generic templates — so nothing gets missed before the next
              guest arrives.
            </p>
          </SectionHead>
          <FadeIn>
            <ul role="list" className="mt-12 flex flex-wrap gap-3">
              {inclusions.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-warm-cream px-6 py-4 text-lg font-semibold"
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </Container>
      </Band>

      <Band tone="forest">
        <Container>
          <SectionHead
            tone="dark"
            kicker="Platforms"
            title="Works with how you already book."
          >
            <p>
              We sync with Airbnb and VRBO calendars and can coordinate direct
              bookings through {site.shortName} as your portfolio grows.
            </p>
          </SectionHead>
          <ValueCards items={platformFeatures} />
        </Container>
      </Band>

      <PhotoBand src={site.images.hero} alt="" />

      <ContactSection />
    </RootLayout>
  )
}
