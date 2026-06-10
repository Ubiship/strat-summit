import { type Metadata } from 'next'
import Image from 'next/image'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { SectionIntro } from '@/components/SectionIntro'
import { StatList, StatListItem } from '@/components/StatList'
import imageMeeting from '@/images/meeting.jpg'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet Joel and Amanda — the team behind Strathcona Summit Solutions on Vancouver Island.',
}

const founders = [
  {
    name: 'Joel',
    role: 'Co-founder — growth & client relationships',
  },
  {
    name: 'Amanda',
    role: 'Co-founder — operations & day-to-day delivery',
  },
]

export default function About() {
  return (
    <RootLayout>
      <PageIntro eyebrow="About us" title="Built on trust, rooted on the Island.">
        <p>
          {site.shortName} started with a simple idea: property owners on
          Vancouver Island deserve a local team that communicates clearly, shows
          up reliably, and treats every home with respect.
        </p>
        <div className="mt-10 max-w-2xl space-y-6 text-base">
          <p>
            Joel and Amanda launched the company to combine property management
            and seasonal renovation work under one accountable partner — so
            owners are not juggling separate vendors for cleaning, maintenance,
            and construction.
          </p>
          <p>
            The name honours Strathcona Park — rugged coast, alpine peaks, and
            the landscape that defines life on the Island. That is the standard we
            bring to your property: sturdy, honest, and built to last.
          </p>
        </div>
      </PageIntro>

      <Container className="mt-16">
        <StatList>
          <StatListItem value="2" label="Founding partners" />
          <StatListItem value="3" label="Service tiers (PM)" />
          <StatListItem value="1" label="Island we call home" />
        </StatList>
      </Container>

      <div className="mt-24 rounded-4xl bg-neutral-950 py-24 ring-1 ring-gold/15 sm:mt-32 lg:mt-40 lg:py-32">
        <SectionIntro
          eyebrow="Our values"
          title="Professional, approachable, and Pacific Northwest at heart."
          invert
        >
          <p>
            We are in people&apos;s homes. That requires more than a checklist —
            it requires judgment, discretion, and genuine care.
          </p>
        </SectionIntro>
        <Container className="mt-16">
          <GridList>
            <GridListItem title="Reliability" invert>
              Turnovers happen on schedule. Renovation milestones are tracked.
              You hear from us when something needs a decision.
            </GridListItem>
            <GridListItem title="Transparency" invert>
              Clear tiers, documented visits, and estimates that explain where
              your money goes.
            </GridListItem>
            <GridListItem title="Local accountability" invert>
              We are not a franchise or a distant management company — Joel and
              Amanda stay close to the work.
            </GridListItem>
          </GridList>
        </Container>
      </div>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeInStagger>
          <h2 className="font-display text-2xl font-semibold text-neutral-950">
            Leadership
          </h2>
          <ul
            role="list"
            className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2"
          >
            {founders.map((person) => (
              <li key={person.name}>
                <FadeIn>
                  <div className="overflow-hidden rounded-3xl bg-neutral-100">
                    <Image
                      src={imageMeeting}
                      alt=""
                      className="h-64 w-full object-cover grayscale"
                    />
                    <div className="p-6">
                      <p className="font-display text-lg font-semibold text-neutral-950">
                        {person.name}
                      </p>
                      <p className="mt-2 text-sm text-neutral-600">
                        {person.role}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-neutral-500">
            Replace placeholder photos with Joel and Amanda headshots when
            available.
          </p>
        </FadeInStagger>
      </Container>

      <ContactSection />
    </RootLayout>
  )
}
