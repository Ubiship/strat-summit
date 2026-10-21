import { type Metadata } from 'next'
import Image from 'next/image'

import { Band } from '@/components/Band'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import imageMeeting from '@/images/meeting.jpg'
import iconLocalAccountability from '@/images/values/icon-local-accountability.png'
import iconReliability from '@/images/values/icon-reliability.png'
import iconTransparency from '@/images/values/icon-transparency.png'
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

const values = [
  {
    title: 'Reliability',
    icon: iconReliability,
    description:
      'Turnovers happen on schedule. Renovation milestones are tracked. You hear from us when something needs a decision.',
  },
  {
    title: 'Transparency',
    icon: iconTransparency,
    description:
      'Clear tiers, documented visits, and estimates that explain where your money goes.',
  },
  {
    title: 'Local accountability',
    icon: iconLocalAccountability,
    description:
      'We are not a franchise or a distant management company — Joel and Amanda stay close to the work.',
  },
]

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
      <PageHero kicker="About us" title="Built on trust, rooted on the Island.">
        <p>
          {site.shortName} started with a simple idea: property owners on
          Vancouver Island deserve a local team that communicates clearly, shows
          up reliably, and treats every home with respect.
        </p>
        <p>
          Joel and Amanda launched the company to combine property management
          and seasonal renovation work under one accountable partner — so owners
          are not juggling separate vendors for cleaning, maintenance, and
          construction.
        </p>
        <p>
          The name honours Strathcona Park — rugged coast, alpine peaks, and the
          landscape that defines life on the Island. That is the standard we
          bring to your property: sturdy, honest, and built to last.
        </p>
      </PageHero>

      <Band tone="sand">
        <Container>
          <FadeInStagger>
            <dl className="grid gap-16 split:grid-cols-3">
              {stats.map((stat) => (
                <FadeIn
                  key={stat.label}
                  className="flex flex-col-reverse items-center text-center"
                >
                  <dt className="mt-6 text-lg font-semibold text-warm-muted">
                    {stat.label}
                  </dt>
                  <dd className="grid size-44 place-items-center rounded-full bg-sun type-display text-[5.75rem] text-warm-ink shadow-[0_24px_50px_rgb(217_119_47/0.3)] split:size-52 split:text-[6.75rem]">
                    {stat.value}
                  </dd>
                </FadeIn>
              ))}
            </dl>
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="forest">
        <Container>
          <SectionHead
            tone="dark"
            kicker="Our values"
            title="Professional, approachable, and Pacific Northwest at heart."
          >
            <p>
              We are in people&apos;s homes. That requires more than a checklist
              — it requires judgment, discretion, and genuine care.
            </p>
          </SectionHead>
          <ValueCards items={values} />
        </Container>
      </Band>

      <Band tone="cream">
        <Container>
          <FadeInStagger>
            <FadeIn>
              <h2 className="type-display text-[clamp(3.5rem,6vw,5.75rem)]">
                Leadership
              </h2>
            </FadeIn>
            <ul role="list" className="mt-14 grid gap-6 split:grid-cols-2">
              {founders.map((person) => (
                <li key={person.name}>
                  <FadeIn className="overflow-hidden rounded-[2.75rem] bg-sand">
                    <Image
                      src={imageMeeting}
                      alt=""
                      sizes="(min-width: 1200px) 36rem, (min-width: 900px) 50vw, 100vw"
                      className="aspect-4/3 w-full object-cover photo-warm"
                    />
                    <div className="p-10">
                      <h3 className="type-display text-[2.625rem]">{person.name}</h3>
                      <p className="mt-3 text-[1.0625rem] text-warm-muted">
                        {person.role}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-sm text-warm-muted">
              Replace placeholder photos with Joel and Amanda headshots when
              available.
            </p>
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
