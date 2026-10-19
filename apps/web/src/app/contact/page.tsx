import { type Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'

import { Band } from '@/components/Band'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SocialMedia } from '@/components/SocialMedia'
import { site } from '@/lib/site'

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className="mt-0.5 size-5 flex-none text-accent"
      />
      <div>
        <dt className="font-medium text-ink">{label}</dt>
        <dd className="mt-1 text-base/[1.6] text-muted">{children}</dd>
      </div>
    </div>
  )
}

function ContactDetails() {
  return (
    <FadeIn className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10">
      <h2 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
        Other ways to reach us
      </h2>
      <dl className="mt-8 space-y-7">
        <DetailRow icon={Mail} label="General inquiries">
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-accent underline decoration-accent/30 decoration-1 underline-offset-4 transition hover:text-accent-deep hover:decoration-accent"
          >
            {site.contactEmail}
          </a>
        </DetailRow>
        <DetailRow icon={Phone} label="Phone">
          {site.phone}
        </DetailRow>
        <DetailRow icon={MapPin} label="Service area">
          Based on Mount Washington, serving properties across the Comox
          Valley and Vancouver Island. Reach out to confirm coverage for your
          address.
        </DetailRow>
      </dl>

      <div className="mt-10 border-t border-line pt-8">
        <Kicker as="h2">Follow us</Kicker>
        <SocialMedia className="mt-5" />
      </div>
    </FadeIn>
  )
}

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${site.shortName} about property management, cleaning, or renovations.`,
}

export default function Contact() {
  return (
    <RootLayout>
      <PageHero
        size="short"
        kicker="Contact"
        title="Let's talk about your property."
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
          position: 'center 35%',
        }}
      >
        <p>
          Tell us a bit about your property and what you need — we will get back
          to you shortly.
        </p>
      </PageHero>

      <Band tone="white" className="pt-16 split:pt-24">
        <Container className="grid items-start gap-5 split:grid-cols-[1.25fr_0.75fr]">
          <ContactForm />
          <ContactDetails />
        </Container>
      </Band>
    </RootLayout>
  )
}
