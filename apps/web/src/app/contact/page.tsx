import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { Offices } from '@/components/Offices'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SocialMedia } from '@/components/SocialMedia'
import { site } from '@/lib/site'

function ContactDetails() {
  return (
    <FadeIn className="rounded-[2.5rem] bg-sand p-8 split:p-10">
      <Kicker as="h2">Service area</Kicker>
      <p className="mt-4 text-base/[1.6] text-warm-muted">
        We serve property owners across Vancouver Island. Reach out to confirm
        coverage for your address.
      </p>
      <Offices className="mt-6" />

      <div className="mt-8 border-t-2 border-warm-cream pt-8">
        <Kicker as="h2">Email & phone</Kicker>
        <dl className="mt-4 grid gap-5 text-base">
          <div>
            <dt className="font-bold text-warm-ink">General inquiries</dt>
            <dd className="mt-1">
              <Link
                href={`mailto:${site.contactEmail}`}
                className="text-warm-muted underline decoration-sun decoration-2 underline-offset-4 hover:text-warm-ink"
              >
                {site.contactEmail}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="font-bold text-warm-ink">Phone</dt>
            <dd className="mt-1 text-warm-muted">{site.phone}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border-t-2 border-warm-cream pt-8">
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
      >
        <p>
          Tell us a bit about your property and what you need — we will get back
          to you shortly.
        </p>
      </PageHero>

      <Band tone="apricot">
        <Container className="grid items-start gap-4.5 split:grid-cols-[1.2fr_0.8fr]">
          <ContactForm />
          <ContactDetails />
        </Container>
      </Band>
    </RootLayout>
  )
}
