import { type Metadata } from 'next'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { cardClasses, IconTile } from '@/components/Card'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cleaning Services',
  description:
    'Vacation rental turnovers, private-use home cleaning, deep cleaning and linen service for Mount Washington homes.',
}

type IconProps = { className?: string }

// Line icons drawn to match the homepage "Why book direct" cards.
function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
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
      {children}
    </svg>
  )
}

function IconChecklist(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="11" y="8" width="26" height="34" rx="3" />
      <path d="M19 8V6h10v2" />
      <path d="m17 19 2.5 2.5L24 17" />
      <path d="M27 20h5" />
      <path d="m17 30 2.5 2.5L24 28" />
      <path d="M27 31h5" />
    </Icon>
  )
}

function IconHome(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 22 24 9l16 13" />
      <path d="M12 19v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V19" />
      <path d="M20 41V30h8v11" />
    </Icon>
  )
}

function IconSparkle(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M22 8c1.2 7.6 4.4 10.8 12 12-7.6 1.2-10.8 4.4-12 12-1.2-7.6-4.4-10.8-12-12 7.6-1.2 10.8-4.4 12-12Z" />
      <path d="M35 30c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z" />
    </Icon>
  )
}

function IconLinen(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="30" width="30" height="8" rx="2" />
      <rect x="11" y="21" width="26" height="8" rx="2" />
      <rect x="13" y="12" width="22" height="8" rx="2" />
    </Icon>
  )
}

const services = [
  {
    title: 'Vacation rental turnovers',
    Icon: IconChecklist,
    description:
      'We use a detailed turnover checklist developed specifically for short-term rentals. From fresh linens and clean bathrooms to the finishing touches guests notice, our checklist helps us deliver the consistent standard of cleanliness that earns five-star ratings.',
  },
  {
    title: 'Private-use home cleaning',
    Icon: IconHome,
    description:
      'Give yourself your Sundays back. Enjoy that last ski run or a slower morning, then leave the cleaning to us. We typically come by during the week after you leave, so your home is ready for your next stay.',
  },
  {
    title: 'Deep cleaning',
    Icon: IconSparkle,
    description:
      'A more thorough clean for the areas that need extra attention, from baseboards and window tracks to appliances. Book a deep clean before a busy season or when your home is due for a reset.',
  },
  {
    title: 'Linen service',
    Icon: IconLinen,
    description:
      'When there’s a pile of sheets and towels and only a few hours between stays, laundry can be the hardest part to keep up with. We wash, treat stains, and fold your linens, with pickup and drop-off available.',
  },
]

export default function Cleaning() {
  return (
    <RootLayout>
      <PageHero
        kicker="Cleaning"
        title="A clean mountain home. More time to enjoy it."
        // TODO: swap for "Cleaning 1" from the client's Google Drive.
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
        }}
        actions={
          <Button href="/contact" tone="light" size="lg" arrow>
            Inquire About Cleaning
          </Button>
        }
      >
        <p>
          Whether you’re welcoming rental guests or heading home after a
          weekend on the mountain, our local team takes care of the cleaning so
          your place is ready for whoever arrives next.
        </p>
      </PageHero>

      <Band>
        <Container>
          <SectionHead kicker="Services" title="What we offer" layout="center">
            <p>
              Some mountain homes need a reset between guest stays. Others need
              a clean after a family weekend. We can help with both, along with
              seasonal deep cleans and linen service when the laundry piles up.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-14 grid gap-8 split:mt-16 split:grid-cols-2">
            {services.map((service) => (
              <FadeIn
                key={service.title}
                className={clsx(cardClasses(), 'flex flex-col p-8 split:p-10')}
              >
                <IconTile icon={service.Icon} />
                <h3 className="mt-10 type-display text-[clamp(2rem,3vw,2.375rem)] text-warm-ink">
                  {service.title}
                </h3>
                <p className="mt-5 text-[1.0625rem]/[1.7] text-warm-muted">
                  {service.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection
        title="Ready to simplify your cleaning routine?"
        button="Inquire About Cleaning"
      >
        Tell us a little about your Mount Washington property and what you need
        help with. We’ll talk through the services that fit, scheduling, and
        pricing.
      </ContactSection>
    </RootLayout>
  )
}
