import Image from 'next/image'
import { type Metadata } from 'next'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { List, ListItem } from '@/components/List'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { TagList, TagListItem } from '@/components/TagList'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Property Management & Cleaning',
  description:
    'Vacation rental cleaning, caretaking, and full property management on Vancouver Island.',
}

export default function PropertyManagement() {
  return (
    <RootLayout>
      <PageIntro
        eyebrow="Property management"
        title="Cleaning, caretaking, and full management for your property."
      >
        <p>
          From scheduled turnover cleans to complete owner support, we offer
          three service tiers so you only pay for the level of involvement you
          need.
        </p>
      </PageIntro>

      <Container className="mt-16 lg:mt-24">
        <div className="lg:flex lg:items-start lg:justify-end lg:gap-x-12">
          <FadeIn className="w-full max-w-lg flex-none lg:w-1/2">
            <StylizedImage
              src={site.images.propertyManagement}
              width={800}
              height={600}
              alt="Model home with keys representing property management"
              grayscale={false}
              sizes="(min-width: 1024px) 33rem, 100vw"
              className="justify-center"
            />
          </FadeIn>
          <div className="mt-12 lg:mt-0 lg:w-1/2">
            <List>
              <ListItem title="Tier 1 — Basic cleaning">
                You send dates, we clean and reset the property. Ideal when you
                handle bookings and guest communication yourself.
              </ListItem>
              <ListItem title="Tier 2 — Cleaning + caretaking">
                Maintenance checks, restocking, and proactive care between guests.
                You stay in control of marketing and bookings.
              </ListItem>
              <ListItem title="Tier 3 — Full property management">
                End-to-end operations: bookings coordination, owner statements,
                and the full payout workflow. Built for hands-off owners.
              </ListItem>
            </List>
          </div>
        </div>
      </Container>

      <SectionIntro
        eyebrow="Included"
        title="What every visit covers"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Our cleaning checklists are built from real turnover workflows — not
          generic templates — so nothing gets missed before the next guest
          arrives.
        </p>
      </SectionIntro>

      <Container className="mt-10">
        <TagList>
          <TagListItem>Turnover cleaning & linen service</TagListItem>
          <TagListItem>Restocking & supplies</TagListItem>
          <TagListItem>Hot tub & exterior checks</TagListItem>
          <TagListItem>Photo documentation</TagListItem>
          <TagListItem>Maintenance flagging</TagListItem>
          <TagListItem>Direct booking intake (Tier 2+)</TagListItem>
        </TagList>
      </Container>

      <div className="mt-24 rounded-4xl bg-neutral-950 py-20 ring-1 ring-gold/15 sm:mt-32 sm:py-28">
        <SectionIntro
          eyebrow="Platforms"
          title="Works with how you already book."
          invert
        >
          <p>
            We sync with Airbnb and VRBO calendars and can coordinate direct
            bookings through {site.shortName} as your portfolio grows.
          </p>
        </SectionIntro>
        <Container className="mt-12">
          <GridList>
            <GridListItem title="Calendar sync" invert>
              iCal integration keeps cleaning jobs aligned with confirmed stays.
            </GridListItem>
            <GridListItem title="Guest-ready standard" invert>
              Consistent checklists and photo records for every turnover.
            </GridListItem>
            <GridListItem title="Owner visibility" invert>
              Tier 3 owners get statements, breakdowns, and a dedicated portal
              as the platform rolls out.
            </GridListItem>
          </GridList>
        </Container>
      </div>

      <Container className="mt-24 lg:mt-32">
        <FadeIn>
          <div className="overflow-hidden rounded-4xl ring-1 ring-gold/20">
            <Image
              src={site.images.hero}
              alt="Snow-capped mountain peak above Vancouver Island forest"
              width={1920}
              height={840}
              className="aspect-16/7 w-full object-cover object-center"
            />
          </div>
        </FadeIn>
      </Container>

      <ContactSection />
    </RootLayout>
  )
}
