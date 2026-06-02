import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { List, ListItem } from '@/components/List'
import { RootLayout } from '@/components/RootLayout'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Testimonial } from '@/components/Testimonial'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  description: site.description,
}

function ServiceOverview() {
  const services = [
    {
      title: 'Property Management & Cleaning',
      href: '/property-management',
      description:
        'Turnover cleaning, caretaking, and full property management for vacation rentals and second homes on Vancouver Island.',
      image: site.images.propertyManagement,
      imageWidth: 800,
      imageHeight: 600,
      shape: 0 as const,
    },
    {
      title: 'Renovations & Construction',
      href: '/renovations',
      description:
        'Seasonal renovation work from estimates through completion — kitchens, bathrooms, decks, and whole-home refreshes.',
      image: site.images.renovations,
      imageWidth: 800,
      imageHeight: 600,
      shape: 1 as const,
    },
  ]

  return (
    <>
      <SectionIntro
        eyebrow="What we do"
        title="Two pillars, one team you can trust in your home."
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Joel and Amanda built Strathcona Summit around reliable, hands-on
          service — the kind of care you want when someone else is looking after
          your property.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {services.map((service) => (
            <FadeIn key={service.href} className="flex flex-col">
              <Link href={service.href} className="group">
                <StylizedImage
                  src={service.image}
                  width={service.imageWidth}
                  height={service.imageHeight}
                  alt={service.title}
                  shape={service.shape}
                  grayscale={false}
                  sizes="(min-width: 1024px) 33rem, 100vw"
                  className="justify-center"
                />
                <h3 className="mt-8 font-display text-2xl font-semibold text-neutral-950 group-hover:text-gold">
                  {service.title}
                </h3>
                <p className="mt-4 text-base text-neutral-600">
                  {service.description}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold">
                  Learn more <span aria-hidden="true">→</span>
                </span>
              </Link>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

function WhyUs() {
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 ring-1 ring-gold/15 sm:mt-32 sm:py-32 lg:mt-40">
      <SectionIntro
        eyebrow="Why owners choose us"
        title="Local, accountable, and detail-oriented."
        invert
      >
        <p>
          We treat every property like our own — clear communication, consistent
          standards, and a team that shows up when guests are on the way.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <GridList>
          <GridListItem title="Island-based" invert>
            We live and work on Vancouver Island. No fly-in crews — just people
            who know the coast, the weather, and your neighbourhood.
          </GridListItem>
          <GridListItem title="Flexible tiers" invert>
            From basic cleaning to full property management with owner payouts,
            we scale with how involved you want us to be.
          </GridListItem>
          <GridListItem title="One point of contact" invert>
            Joel and Amanda stay close to the work. You are not passed through a
            call centre when something needs attention.
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

function Approach() {
  return (
    <>
      <SectionIntro
        eyebrow="How we work"
        title="Straightforward process, no surprises."
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          Whether it is a turnover clean or a summer renovation, we keep the
          steps clear so you always know what happens next.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <List className="max-w-3xl">
          <ListItem title="Listen first">
            We start with your property, your goals, and how hands-on you want us
            to be — then recommend the right service tier.
          </ListItem>
          <ListItem title="Document everything">
            Checklists, photos, and updates so owners and guests see the same
            standard every visit.
          </ListItem>
          <ListItem title="Communicate clearly">
            Booking changes, maintenance flags, and project milestones — you hear
            from us before small issues become big ones.
          </ListItem>
          <ListItem title="Deliver consistently">
            The same crew, the same quality bar, whether it is a Tuesday turnover
            or a July renovation push.
          </ListItem>
        </List>
      </Container>
    </>
  )
}

export default function Home() {
  return (
    <>
      <EntrySplash />
      <RootLayout>
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <FadeIn className="max-w-3xl">
          <p className="font-display text-sm font-semibold tracking-wider text-gold uppercase">
            Vancouver Island
          </p>
          <h1 className="mt-4 font-display text-5xl font-medium tracking-tight text-balance text-neutral-950 sm:text-7xl">
            Property care and renovations, done right.
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            {site.tagline} Joel and Amanda founded {site.shortName} to give
            homeowners and hosts a reliable local partner — from turnover
            cleaning to full management and seasonal construction.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white transition hover:bg-gold-dark"
            >
              Get in touch
            </Link>
            <Link
              href="/property-management"
              className="inline-flex rounded-full px-5 py-2 text-sm font-semibold text-neutral-950 ring-1 ring-gold/30 transition hover:bg-gold/10"
            >
              View services
            </Link>
          </div>
        </FadeIn>
      </Container>

      <div className="relative mt-16 sm:mt-24">
        <Container>
          <FadeIn>
            <div className="overflow-hidden rounded-4xl ring-1 ring-gold/20">
              <Image
                src={site.images.hero}
                alt="Snow-capped mountain peak above Vancouver Island forest"
                width={1920}
                height={840}
                className="aspect-16/7 w-full object-cover object-center"
                priority
              />
            </div>
          </FadeIn>
        </Container>
      </div>

      <ServiceOverview />
      <WhyUs />

      <Testimonial
        className="mt-24 sm:mt-32 lg:mt-40"
        client={{ name: 'Property owner', logo: null }}
      >
        Placeholder testimonial — replace with a quote from a Vancouver Island
        owner once we have approval to publish.
      </Testimonial>

      <Approach />
      <ContactSection />
    </RootLayout>
    </>
  )
}
