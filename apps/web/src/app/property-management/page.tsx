import { type Metadata } from 'next'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { CtaPanel } from '@/components/CtaPanel'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Mount Washington Property Management',
  description:
    'Full-service short-term rental management for Mount Washington vacation homes. Bookings, guests, and everyday care from a local team.',
}

function IconRevenue({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 38V18l18-12 18 12v20" />
      <path d="M6 38h36" />
      <path d="M18 38V26h12v12" />
      <circle cx="24" cy="18" r="3" />
    </svg>
  )
}

function IconMarketing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="6" y="10" width="36" height="28" rx="4" />
      <path d="M6 18h36" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      <circle cx="20" cy="14" r="1.5" fill="currentColor" />
      <path d="M14 28h20M14 34h12" />
    </svg>
  )
}

function IconCare({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 38V22l12-12 12 12v16a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2Z" />
      <path d="M20 38v-10h8v10" />
      <path d="M18 22h12" />
    </svg>
  )
}

function IconOversight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="8" width="32" height="32" rx="4" />
      <path d="M8 16h32" />
      <path d="M16 8v8" />
      <path d="M16 26l4 4 8-8" />
    </svg>
  )
}

const services = [
  {
    title: 'Revenue & Booking Management',
    Icon: IconRevenue,
    description:
      "Thoughtful pricing through the mountain's changing seasons, coordinated calendars, and room for the time you want to spend here yourself.",
  },
  {
    title: 'Marketing & Guest Experience',
    Icon: IconMarketing,
    description:
      'Listings that show what makes your home special, clear guest communication, and the practical details that help people settle in.',
  },
  {
    title: 'Local Property Care',
    Icon: IconCare,
    description:
      'From a freshly prepared home to supplies running low or something needing repair, we coordinate the care that keeps your property ready for the next stay.',
  },
  {
    title: 'Owner Oversight',
    Icon: IconOversight,
    description:
      'Clear reporting, visibility into your property, and a local team you can talk to about how things are going.',
  },
]

export default function PropertyManagement() {
  return (
    <RootLayout>
      {/* 1. OPENING */}
      <PageHero
        kicker="Mount Washington Property Management"
        title="Your mountain home. Our everyday care."
        size="short"
        image={{
          src: site.images.hero,
          alt: 'Mount Washington alpine landscape',
        }}
      >
        <p>
          Full-service short-term rental management from Joel, Amanda, and our
          local team. We look after the bookings, the guests, and the details
          that keep your Mount Washington home ready to welcome them.
        </p>
      </PageHero>

      <Band>
        <Container>
          <FadeIn className="text-center">
            <Button href="/contact" tone="forest" size="lg" arrow>
              Let's Talk About Your Property
            </Button>
          </FadeIn>
        </Container>
      </Band>

      {/* 2. WHAT'S INCLUDED */}
      <Band>
        <Container>
          <FadeIn>
            <p className="mx-auto max-w-3xl text-center text-[1.25rem]/[1.6] text-warm-ink/80">
              There's a lot behind a great mountain stay. We bring it together,
              so you can enjoy your home without managing every moving part.
            </p>
          </FadeIn>

          <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2">
            {services.map((service) => (
              <FadeIn
                key={service.title}
                className="flex flex-col rounded-[3rem] bg-white p-10 shadow-[0_8px_32px_rgb(22_56_38/0.06),0_2px_8px_rgb(22_56_38/0.03)] split:p-12"
              >
                <div className="flex size-16 items-center justify-center rounded-2xl bg-forest-warm/8">
                  <service.Icon className="size-10 text-forest-warm" />
                </div>
                <h3 className="mt-8 type-display text-[clamp(1.75rem,2.5vw,2.125rem)] text-warm-ink">
                  {service.title}
                </h3>
                <p className="mt-4 text-[1.0625rem]/[1.7] text-warm-muted">
                  {service.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      {/* 3. ONE LOCAL TEAM */}
      <Band>
        <Container>
          <FadeIn className="mx-auto max-w-3xl">
            <h2 className="type-display text-center text-[clamp(2.5rem,4vw,3.5rem)] text-warm-ink">
              We know the work behind the welcome.
            </h2>
            <div className="mt-10 space-y-6 text-[1.125rem]/[1.7] text-warm-ink/80">
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

      {/* 4. FINAL CONTACT SECTION */}
      <CtaPanel
        title="Let's talk about your mountain home."
        actions={
          <Button href="/contact" tone="forest" size="lg" arrow>
            Let's Talk About Your Property
          </Button>
        }
      >
        <p>
          Maybe it&apos;s your family&apos;s weekend escape, an investment, or a bit of
          both. Tell us how you use it and what you&apos;d like renting it to look
          like. We&apos;ll start there.
        </p>
      </CtaPanel>
    </RootLayout>
  )
}
