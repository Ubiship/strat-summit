import { type Metadata } from 'next'
import {
  BedDouble,
  CalendarSync,
  Camera,
  ClipboardCheck,
  Flag,
  Inbox,
  KeyRound,
  LayoutDashboard,
  PackageCheck,
  Sparkles,
  Waves,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import {
  ThreeColumnFeaturesWithImage,
  type Feature,
} from '@/components/ui/three-column-features-with-image'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Property Management & Cleaning',
  description:
    'Vacation rental cleaning, caretaking, and full property management on Vancouver Island.',
}

// Images are placeholders until final photography.
const tiers: Feature[] = [
  {
    title: 'Basic cleaning',
    icon: Sparkles,
    description:
      'You send dates, we clean and reset the property. Ideal when you handle bookings and guest communication yourself.',
    image: { src: '/HeroImage.jpg', alt: 'Mount Washington above the forest' },
  },
  {
    title: 'Cleaning + caretaking',
    icon: Wrench,
    description:
      'Maintenance checks, restocking, and proactive care between guests. You stay in control of marketing and bookings.',
    image: { src: '/Renos.png', alt: 'A home being cared for between stays' },
  },
  {
    title: 'Full property management',
    icon: KeyRound,
    description:
      'End-to-end operations: bookings coordination, owner statements, and the full payout workflow. Built for hands-off owners.',
    image: { src: '/PropertyManagment.png', alt: 'House keys on a table' },
  },
]

const inclusions: { label: string; icon: LucideIcon }[] = [
  { label: 'Turnover cleaning & linen service', icon: BedDouble },
  { label: 'Restocking & supplies', icon: PackageCheck },
  { label: 'Hot tub & exterior checks', icon: Waves },
  { label: 'Photo documentation', icon: Camera },
  { label: 'Maintenance flagging', icon: Flag },
  { label: 'Direct booking intake (Tier 2+)', icon: Inbox },
]

const platformFeatures: {
  title: string
  description: string
  icon: LucideIcon
}[] = [
  {
    title: 'Calendar sync',
    icon: CalendarSync,
    description:
      'iCal integration keeps cleaning jobs aligned with confirmed stays.',
  },
  {
    title: 'Guest-ready standard',
    icon: ClipboardCheck,
    description: 'Consistent checklists and photo records for every turnover.',
  },
  {
    title: 'Owner visibility',
    icon: LayoutDashboard,
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

      <ThreeColumnFeaturesWithImage
        kicker="Service tiers"
        title="Choose how involved we are."
        features={tiers}
      />

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="grid gap-14 border-t border-line pt-24 split:grid-cols-[1fr_1.1fr] split:gap-20 split:pt-36">
            <SectionHead kicker="Included" title="What every visit covers.">
              <p>
                Our cleaning checklists are built from real turnover workflows —
                not generic templates — so nothing gets missed before the next
                guest arrives.
              </p>
            </SectionHead>

            <FadeIn>
              <ul role="list" className="border-b border-line">
                {inclusions.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-5 border-t border-line py-5 split:py-6"
                  >
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-6 flex-none text-accent"
                    />
                    <span className="text-[1.125rem] font-medium tracking-[-0.01em] text-ink">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <div className="border-t border-line pt-24 split:pt-36">
            <SectionHead
              kicker="Platforms"
              title="Works with how you already book."
            >
              <p>
                We sync with Airbnb and VRBO calendars and can coordinate direct
                bookings through {site.shortName} as your portfolio grows.
              </p>
            </SectionHead>

            <FadeInStagger className="mt-14 grid gap-12 split:mt-20 split:grid-cols-3 split:gap-10">
              {platformFeatures.map(({ title, description, icon: Icon }) => (
                <FadeIn key={title} className="border-t border-line pt-8">
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-6 text-accent"
                  />
                  <h3 className="mt-5 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-base/[1.6] text-muted">
                    {description}
                  </p>
                </FadeIn>
              ))}
            </FadeInStagger>
          </div>
        </Container>
      </Band>

      <PropertiesCta audience="owners" />
    </RootLayout>
  )
}
