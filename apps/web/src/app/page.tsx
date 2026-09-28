import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { NumberBadge } from '@/components/NumberBadge'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { ValueCards } from '@/components/ValueCards'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  description: site.description,
}

type Service = {
  title: string
  href: string
  description: string
  image: string | null
}

const services: Array<Service> = [
  {
    title: 'Property Management',
    href: '/property-management',
    description:
      'Full-service vacation rental management, including guest communication, revenue optimization, booking management, and property oversight.',
    image: site.images.hero,
  },
  {
    title: 'Property Support Services',
    href: '/contact',
    description:
      'Cleaning, laundry, inspections, maintenance, and guest-ready support for self-managed properties.',
    image: null,
  },
  {
    title: 'Renovations & Improvements',
    href: '/renovations',
    description:
      "Repairs, upgrades, and renovation projects that enhance your property's value, functionality, and guest experience.",
    image: site.images.renovations,
  },
]

const reasons = [
  {
    title: 'Local expertise',
    description:
      'Based on Mount Washington, we provide responsive support and year-round oversight.',
  },
  {
    title: 'Hospitality standards',
    description:
      'Our background in luxury hospitality influences every aspect of the guest and owner experience.',
  },
  {
    title: 'One trusted team',
    description:
      'Property management, support services, and renovations—all coordinated through one trusted team.',
  },
]

function ServiceTile({ service, index }: { service: Service; index: number }) {
  let photo = service.image !== null

  return (
    <FadeIn
      className={clsx(
        'relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2.75rem] p-7 split:min-h-[29rem]',
        photo ? 'bg-forest-warm text-warm-cream' : 'bg-sun text-warm-ink',
      )}
    >
      {service.image !== null && (
        <>
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(min-width: 75rem) 27rem, (min-width: 900px) 38vw, 100vw"
            className="-z-20 object-cover photo-warm"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 tile-shade"
          />
        </>
      )}
      <NumberBadge
        value={index + 1}
        tone={photo ? 'cream' : 'ink'}
        className="absolute top-6 left-6"
      />
      <h3 className="type-display text-[clamp(2.125rem,3.2vw,2.875rem)]">
        {service.title}
      </h3>
      <p className="mt-3 mb-5 text-base/[1.45] opacity-90">
        {service.description}
      </p>
      <Button
        href={service.href}
        tone={photo ? 'sun' : 'cream'}
        size="sm"
        aria-label={`Learn more about ${service.title}`}
        className="self-start"
      >
        Learn more
      </Button>
    </FadeIn>
  )
}

function Services() {
  return (
    <Band tone="sand">
      <Container>
        <SectionHead
          kicker="How we support property owners"
          title="One local team. Complete property care."
        >
          <p>
            Owning a mountain property comes with unique responsibilities. We
            help owners simplify the process through professional management,
            dependable local support, and thoughtful property improvements.
          </p>
        </SectionHead>
        <FadeInStagger className="mt-12 grid gap-4.5 split:grid-cols-[1.25fr_1fr_1fr]">
          {services.map((service, index) => (
            <ServiceTile key={service.title} service={service} index={index} />
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}

function WhyUs() {
  return (
    <Band tone="forest" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-36 size-[32.5rem] rounded-full sun-glow"
      />
      <Container className="relative">
        <SectionHead
          tone="dark"
          kicker="Why owners choose us"
          title="Local expertise. Hospitality standards. One trusted team."
        >
          <p>
            We bring together professional property management, luxury
            hospitality experience, and hands-on local support to help owners
            maximize value and deliver exceptional guest experiences.
          </p>
        </SectionHead>
        <ValueCards items={reasons} />
      </Container>
    </Band>
  )
}

export default function Home() {
  return (
    <>
      <EntrySplash />
      <RootLayout>
        <PageHero
          size="full"
          kicker="Mount Washington"
          title="Property management from a team that lives here."
          image={{
            src: site.images.hero,
            alt: 'Mount Washington alpine landscape',
          }}
          actions={
            <>
              <Button href="/contact" arrow>
                Get in touch
              </Button>
              <Button href="/property-management" tone="glass">
                View services
              </Button>
            </>
          }
        >
          <p>
            We built {site.name} to give homeowners and vacation rental hosts a
            dependable local partner for property management. Backed by in-house
            cleaning, maintenance, and renovation services, we help owners
            maximize revenue, protect their investment, and deliver exceptional
            guest experiences.
          </p>
        </PageHero>
        <Services />
        <WhyUs />
        <ContactSection />
      </RootLayout>
    </>
  )
}
