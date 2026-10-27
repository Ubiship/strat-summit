import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { cardClasses } from '@/components/Card'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
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
    image: site.images.joel,
    // Head-and-shoulders frame; keep his face in the upper half of the crop.
    position: 'center 32%',
  },
  {
    name: 'Amanda',
    role: 'Co-founder — operations & day-to-day delivery',
    image: site.images.amanda,
    position: 'center 28%',
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

      <Band>
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
                  <dd className="grid size-44 place-items-center rounded-full bg-sand type-display text-[5.75rem] text-forest-warm split:size-52 split:text-[6.75rem]">
                    {stat.value}
                  </dd>
                </FadeIn>
              ))}
            </dl>
          </FadeInStagger>
        </Container>
      </Band>

      <Band>
        <Container>
          <SectionHead
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

      <Band>
        <Container>
          <FadeInStagger>
            <SectionHead title="Leadership" />
            <ul role="list" className="mt-14 grid gap-6 split:grid-cols-2">
              {founders.map((person) => (
                <li key={person.name}>
                  <FadeIn
                    className={clsx(cardClasses({ tone: 'tint' }), 'overflow-hidden')}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={person.image}
                        alt=""
                        fill
                        sizes="(min-width: 56.25rem) 36rem, 100vw"
                        className="object-cover photo-grade"
                        style={{ objectPosition: person.position }}
                      />
                    </div>
                    <div className="p-8 split:p-10">
                      <h3 className="type-display text-[2.625rem]">
                        {person.name}
                      </h3>
                      <p className="mt-2 text-[1.0625rem] text-warm-muted">
                        {person.role}
                      </p>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection />
    </RootLayout>
  )
}
