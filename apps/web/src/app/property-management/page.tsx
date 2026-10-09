import { type Metadata } from 'next'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PhotoBand } from '@/components/PhotoBand'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import iconBookingIntake from '@/images/icons/icon-booking-intake.png'
import iconHotTub from '@/images/icons/icon-hot-tub.png'
import iconLinenService from '@/images/icons/icon-linen-service.png'
import iconMaintenanceFlag from '@/images/icons/icon-maintenance-flag.png'
import iconPhotoDocumentation from '@/images/icons/icon-photo-documentation.png'
import iconRestocking from '@/images/icons/icon-restocking.png'
import iconTierBasic from '@/images/icons/icon-tier-basic.png'
import iconTierCaretaking from '@/images/icons/icon-tier-caretaking.png'
import iconTierFull from '@/images/icons/icon-tier-full.png'
import iconCalendarSync from '@/images/values/icon-calendar-sync.png'
import iconGuestReady from '@/images/values/icon-guest-ready.png'
import iconOwnerVisibility from '@/images/values/icon-owner-visibility.png'
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
    icon: iconTierBasic,
    description:
      'You send dates, we clean and reset the property. Ideal when you handle bookings and guest communication yourself.',
    tone: 'bg-sand text-warm-ink',
  },
  {
    label: 'Tier 2',
    title: 'Cleaning + caretaking',
    icon: iconTierCaretaking,
    description:
      'Maintenance checks, restocking, and proactive care between guests. You stay in control of marketing and bookings.',
    tone: 'bg-sun text-warm-ink',
  },
  {
    label: 'Tier 3',
    title: 'Full property management',
    icon: iconTierFull,
    description:
      'End-to-end operations: bookings coordination, owner statements, and the full payout workflow. Built for hands-off owners.',
    tone: 'bg-forest-warm text-warm-cream',
  },
]

const inclusions = [
  { label: 'Turnover cleaning & linen service', icon: iconLinenService },
  { label: 'Restocking & supplies', icon: iconRestocking },
  { label: 'Hot tub & exterior checks', icon: iconHotTub },
  { label: 'Photo documentation', icon: iconPhotoDocumentation },
  { label: 'Maintenance flagging', icon: iconMaintenanceFlag },
  { label: 'Direct booking intake (Tier 2+)', icon: iconBookingIntake },
]

const platformFeatures = [
  {
    title: 'Calendar sync',
    icon: iconCalendarSync,
    description:
      'iCal integration keeps cleaning jobs aligned with confirmed stays.',
  },
  {
    title: 'Guest-ready standard',
    icon: iconGuestReady,
    description: 'Consistent checklists and photo records for every turnover.',
  },
  {
    title: 'Owner visibility',
    icon: iconOwnerVisibility,
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
          <FadeInStagger className="grid gap-6 split:grid-cols-[1fr_1fr_1.35fr]">
            {tiers.map((tier) => (
              <FadeIn
                key={tier.label}
                className={clsx(
                  'flex min-h-[24rem] flex-col rounded-[2.75rem] p-10',
                  tier.tone,
                )}
              >
                <p className="text-sm font-bold tracking-[0.1em] uppercase">
                  {tier.label}
                </p>
                <CardIcon src={tier.icon} className="mt-6" />
                <h2 className="mt-auto pt-10 type-display text-[clamp(2.375rem,3.4vw,3.125rem)]">
                  {tier.title}
                </h2>
                <p className="mt-4 text-[1.0625rem]/[1.55] opacity-90">
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
            <ul role="list" className="mt-16 flex flex-wrap gap-4">
              {inclusions.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-full bg-warm-cream py-3 pr-7 pl-3.5 text-lg font-semibold"
                >
                  <CardIcon src={item.icon} size="sm" />
                  {item.label}
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
