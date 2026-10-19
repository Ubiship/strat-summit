import { type Metadata } from 'next'
import {
  type LucideIcon,
  Eye,
  KeyRound,
  Megaphone,
  TrendingUp,
} from 'lucide-react'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Mount Washington Property Management',
  description:
    'Full-service short-term rental management for Mount Washington vacation homes. Bookings, guests, and everyday care from a local team.',
}

const services: { title: string; icon: LucideIcon; description: string }[] = [
  {
    title: 'Revenue & Booking Management',
    icon: TrendingUp,
    description:
      "Thoughtful pricing through the mountain's changing seasons, coordinated calendars, and room for the time you want to spend here yourself.",
  },
  {
    title: 'Marketing & Guest Experience',
    icon: Megaphone,
    description:
      'Listings that show what makes your home special, clear guest communication, and the practical details that help people settle in.',
  },
  {
    title: 'Local Property Care',
    icon: KeyRound,
    description:
      'From a freshly prepared home to supplies running low or something needing repair, we coordinate the care that keeps your property ready for the next stay.',
  },
  {
    title: 'Owner Oversight',
    icon: Eye,
    description:
      'Clear reporting, visibility into your property, and a local team you can talk to about how things are going.',
  },
]

export default function PropertyManagement() {
  return (
    <RootLayout>
      <PageHero
        kicker="Mount Washington Property Management"
        title="Your mountain home. Our everyday care."
        size="short"
        image={{
          src: site.images.hero,
          alt: 'Mount Washington alpine landscape',
        }}
        actions={
          <Button href="/contact" arrow>
            Let&apos;s talk about your property
          </Button>
        }
      >
        <p>
          Full-service short-term rental management from Joel, Amanda, and our
          local team. We look after the bookings, the guests, and the details
          that keep your Mount Washington home ready to welcome them.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <SectionHead
            kicker="What's included"
            title="There's a lot behind a great mountain stay."
          >
            <p>
              We bring it together, so you can enjoy your home without managing
              every moving part.
            </p>
          </SectionHead>

          <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-2">
            {services.map(({ title, icon: Icon, description }) => (
              <FadeIn
                key={title}
                className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-7 text-accent"
                />
                <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-[1.0625rem]/[1.65] text-muted">
                  {description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="white" className="pt-0! split:pt-0!">
        <Container>
          <FadeIn className="grid gap-10 border-t border-line pt-24 split:grid-cols-[0.9fr_1.1fr] split:gap-20 split:pt-36">
            <div>
              <Kicker>One local team</Kicker>
              <h2 className="mt-4 type-display text-[clamp(2.5rem,5vw,4rem)] text-balance text-ink">
                We know the work behind the welcome.
              </h2>
            </div>
            <div className="space-y-5 text-[1.125rem]/[1.7] text-muted split:pt-2">
              <p>
                Our roots are in cleaning and caring for mountain homes. That
                hands-on experience shapes how we manage them today: we know the
                work it takes to get a property ready, the details guests
                notice, and what needs attention between stays.
              </p>
              <p>
                Joel and Amanda bring that same care to the bookings and guest
                experience, with one team connecting it all.
              </p>
              <p>
                Before your first managed booking, we work through a structured
                launch to get your home, listing, guest information, and
                operating systems ready together.
              </p>
            </div>
          </FadeIn>
        </Container>
      </Band>

      <PropertiesCta
        audience="owners"
        title="Let's talk about your mountain home."
        description="Maybe it's your family's weekend escape, an investment, or a bit of both. Tell us how you use it and what you'd like renting it to look like. We'll start there."
        primaryLabel="Let's talk"
      />
    </RootLayout>
  )
}
