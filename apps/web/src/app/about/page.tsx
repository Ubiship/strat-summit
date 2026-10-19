import { type Metadata } from 'next'
import Image from 'next/image'
import { CalendarCheck, Eye, MapPin } from 'lucide-react'

import { Band } from '@/components/Band'
import { PropertiesCta } from '@/components/PropertiesCta'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import {
  ThreeColumnFeaturesWithImage,
  type Feature,
} from '@/components/ui/three-column-features-with-image'
import imageMeeting from '@/images/meeting.jpg'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet Joel and Amanda — the team behind Strathcona Summit Solutions on Vancouver Island.',
}

const stats = [
  { value: '2', label: 'Founding partners' },
  { value: '3', label: 'Service tiers (PM)' },
  { value: '1', label: 'Island we call home' },
]

// Images are placeholders until final photography.
const values: Feature[] = [
  {
    title: 'Reliability',
    icon: CalendarCheck,
    description:
      'Turnovers happen on schedule. Renovation milestones are tracked. You hear from us when something needs a decision.',
    image: { src: '/PropertyManagment.png', alt: 'House keys on a table' },
  },
  {
    title: 'Transparency',
    icon: Eye,
    description:
      'Clear tiers, documented visits, and estimates that explain where your money goes.',
    image: { src: '/Renos.png', alt: 'A home renovation in progress' },
  },
  {
    title: 'Local accountability',
    icon: MapPin,
    description:
      'We are not a franchise or a distant management company — Joel and Amanda stay close to the work.',
    image: { src: '/HeroImage.jpg', alt: 'Mount Washington above the forest' },
  },
]

// Placeholder photo until Joel and Amanda's headshots are available.
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
      <PageHero
        kicker="About us"
        title="Built on trust, rooted on the Island."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
          position: 'center 35%',
        }}
      >
        <p>
          {site.shortName} started with a simple idea: property owners on
          Vancouver Island deserve a local team that communicates clearly, shows
          up reliably, and treats every home with respect.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <div className="grid gap-10 split:grid-cols-[0.9fr_1.1fr] split:gap-20">
            <FadeIn>
              <Kicker>Our story</Kicker>
              <h2 className="mt-4 type-display text-[clamp(2.5rem,5vw,4rem)] text-balance">
                One accountable partner.
              </h2>
            </FadeIn>
            <FadeIn className="space-y-6 text-[1.1875rem]/[1.6] text-pretty text-muted split:pt-12">
              <p>
                Joel and Amanda launched the company to combine property
                management and seasonal renovation work under one accountable
                partner — so owners are not juggling separate vendors for
                cleaning, maintenance, and construction.
              </p>
              <p>
                The name honours Strathcona Park — rugged coast, alpine peaks,
                and the landscape that defines life on the Island. That is the
                standard we bring to your property: sturdy, honest, and built to
                last.
              </p>
            </FadeIn>
          </div>

          <FadeInStagger>
            <dl className="mt-20 grid gap-10 split:mt-28 split:grid-cols-3">
              {stats.map((stat) => (
                <FadeIn
                  key={stat.label}
                  className="flex flex-col-reverse border-t border-line pt-8"
                >
                  <dt className="mt-2 text-base text-muted">{stat.label}</dt>
                  <dd className="type-display text-[clamp(3.5rem,6vw,5rem)] text-ink">
                    {stat.value}
                  </dd>
                </FadeIn>
              ))}
            </dl>
          </FadeInStagger>
        </Container>
      </Band>

      <ThreeColumnFeaturesWithImage
        kicker="Our values"
        title="Professional, approachable, and Pacific Northwest at heart."
        intro={
          <p>
            We are in people&apos;s homes. That requires more than a checklist
            — it requires judgment, discretion, and genuine care.
          </p>
        }
        features={values}
        className="pt-0 split:pt-0"
      />

      <Band tone="white" className="pt-0 split:pt-0">
        <Container>
          <SectionHead kicker="Leadership" title="The people behind the work.">
            <p>
              Two founders, close to every property we look after.
            </p>
          </SectionHead>
          <FadeInStagger>
            <ul
              role="list"
              className="mt-14 grid gap-14 split:mt-20 split:grid-cols-2 split:gap-8"
            >
              {founders.map((person) => (
                <li key={person.name}>
                  <FadeIn>
                    <div className="relative aspect-4/3 overflow-hidden rounded-[1.5rem] bg-mist">
                      <Image
                        src={imageMeeting}
                        alt=""
                        fill
                        sizes="(min-width: 1200px) 36rem, (min-width: 900px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="mt-7 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                      {person.name}
                    </h3>
                    <p className="mt-2 text-base/[1.6] text-muted">
                      {person.role}
                    </p>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </FadeInStagger>
        </Container>
      </Band>

      <PropertiesCta audience="owners" />
    </RootLayout>
  )
}
