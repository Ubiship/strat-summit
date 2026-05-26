import { type Metadata } from 'next'
import Link from 'next/link'

import { Border } from '@/components/Border'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Offices } from '@/components/Offices'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { SocialMedia } from '@/components/SocialMedia'
import { site } from '@/lib/site'

function ContactDetails() {
  return (
    <FadeIn>
      <h2 className="font-display text-base font-semibold text-neutral-950">
        Service area
      </h2>
      <p className="mt-6 text-base text-neutral-600">
        We serve property owners across Vancouver Island. Reach out to confirm
        coverage for your address.
      </p>

      <Offices className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2" />

      <Border className="mt-16 pt-16">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Email & phone
        </h2>
        <dl className="mt-6 grid grid-cols-1 gap-8 text-sm">
          <div>
            <dt className="font-semibold text-neutral-950">General inquiries</dt>
            <dd className="mt-2">
              <Link
                href={`mailto:${site.contactEmail}`}
                className="text-neutral-600 hover:text-neutral-950"
              >
                {site.contactEmail}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-neutral-950">Phone</dt>
            <dd className="mt-2 text-neutral-600">{site.phone}</dd>
          </div>
        </dl>
      </Border>

      <Border className="mt-16 pt-16">
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Follow us
        </h2>
        <SocialMedia className="mt-6" />
      </Border>
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
      <PageIntro eyebrow="Contact" title="Let's talk about your property.">
        <p>
          Tell us a bit about your property and what you need — we will get back
          to you shortly.
        </p>
      </PageIntro>

      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <div className="grid grid-cols-1 gap-x-8 gap-y-24 lg:grid-cols-2">
          <ContactForm />
          <ContactDetails />
        </div>
      </Container>
    </RootLayout>
  )
}
