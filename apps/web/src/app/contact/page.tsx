import { type Metadata } from 'next'
import Link from 'next/link'

import { Band } from '@/components/Band'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { site } from '@/lib/site'

function ContactDetails() {
  return (
    <FadeIn className="rounded-[2.5rem] bg-sand p-8 split:p-10">
      <Kicker as="h2">Service area</Kicker>
      <p className="mt-4 text-base/[1.6] text-warm-muted">
        Serving Mount Washington and the surrounding Comox Valley.
      </p>

      <div className="mt-8 border-t-2 border-warm-cream pt-8">
        <Kicker as="h2">Email & phone</Kicker>
        <dl className="mt-4 grid gap-5 text-base">
          <div>
            <dt className="font-bold text-warm-ink">Email</dt>
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
        <Kicker as="h2">Mailing address</Kicker>
        <address className="mt-4 text-base/[1.6] text-warm-muted not-italic">
          P.O. Box 3866, Station Main
          <br />
          Courtenay, BC V9N 7P2
          <br />
          Canada
        </address>
      </div>
    </FadeIn>
  )
}

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${site.shortName} about vacation rentals, property management, cleaning, or renovations.`,
}

export default function Contact() {
  return (
    <RootLayout>
      <PageHero size="short" title="Let's chat.">
        <p>
          Whether you have questions about a booking, want to discuss property
          management, or are thinking about a renovation, we would love to hear
          from you.
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
