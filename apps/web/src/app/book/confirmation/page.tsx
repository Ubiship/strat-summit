import { type Metadata } from 'next'
import { Check, Mail, Phone } from 'lucide-react'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Booking Confirmation',
  description: 'Your booking has been confirmed. Check your email for details.',
}

const nextSteps = [
  'Check your email for the confirmation message',
  'Review your check-in instructions',
  'Add our contact number to your phone',
  'Arrive at your scheduled check-in time',
]

export default async function BookingConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ reservation_id?: string }>
}) {
  const params = await searchParams
  const reservationId = params.reservation_id

  return (
    <RootLayout>
      <PageHero
        size="short"
        kicker="Booking confirmed"
        title="Thank you for your booking!"
        image={{
          src: site.images.hero,
          alt: 'Snow-capped Mount Washington above the forest',
          position: 'center 35%',
        }}
      >
        <p>
          We&apos;re excited to host you. Your confirmation details have been
          sent to your email.
        </p>
      </PageHero>

      <Band tone="white" className="pt-16 split:pt-24">
        <Container>
          <FadeInStagger className="grid items-start gap-5 split:grid-cols-[1.25fr_0.75fr]">
            <FadeIn className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10">
              <h2 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                Confirmation details
              </h2>

              {reservationId ? (
                <>
                  <dl className="mt-6">
                    <dt className="text-sm font-medium text-muted">
                      Confirmation number
                    </dt>
                    <dd className="mt-2 font-mono text-[1.75rem] font-semibold tracking-tight text-ink">
                      {reservationId}
                    </dd>
                  </dl>
                  <p className="mt-4 text-base/[1.6] text-muted">
                    Please save your confirmation number for your records.
                    You&apos;ll need it for check-in.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-base/[1.6] text-muted">
                  Your booking has been confirmed. Please check your email for
                  your confirmation number and booking details.
                </p>
              )}

              <div className="mt-10 border-t border-line pt-8">
                <Kicker as="h3">What&apos;s next?</Kicker>
                <ol className="mt-5 space-y-4 text-base text-ink">
                  {nextSteps.map((step) => (
                    <li key={step} className="flex gap-3">
                      <Check
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="mt-0.5 size-5 flex-none text-accent"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>

            <FadeIn className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10">
              <h2 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                Need help?
              </h2>
              <p className="mt-4 text-base/[1.6] text-muted">
                Check your confirmation email for answers to common questions
                about your stay. If you have any questions before your arrival,
                don&apos;t hesitate to reach out to our team.
              </p>
              <ul className="mt-6 space-y-3 text-base">
                <li className="flex items-center gap-3">
                  <Mail
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-5 flex-none text-accent"
                  />
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="text-accent underline decoration-accent/30 decoration-1 underline-offset-4 transition hover:text-accent-deep hover:decoration-accent"
                  >
                    {site.contactEmail}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-muted">
                  <Phone
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-5 flex-none text-accent"
                  />
                  {site.phone}
                </li>
              </ul>
              <Button href="/contact" tone="outline" size="sm" className="mt-8">
                Contact us
              </Button>
            </FadeIn>
          </FadeInStagger>
        </Container>
      </Band>

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
