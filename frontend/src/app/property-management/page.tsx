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
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'
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
              src={imageMeeting}
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

      <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-28">
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
          <StylizedImage
            src={imageWhiteboard}
            shape={1}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="justify-center"
          />
        </FadeIn>
      </Container>

      <ContactSection />
    </RootLayout>
  )
}
