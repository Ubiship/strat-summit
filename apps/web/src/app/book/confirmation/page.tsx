import { type Metadata } from 'next'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'

export const metadata: Metadata = {
  title: 'Booking Confirmation',
  description: 'Your booking has been confirmed. Check your email for details.',
}

export default async function BookingConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ reservation_id?: string }>
}) {
  const params = await searchParams
  const reservationId = params.reservation_id

  return (
    <RootLayout>
      <PageHero size="short" title="Thank you for your booking!">
        <p>We're excited to host you. Your confirmation details have been sent to your email.</p>
      </PageHero>

      <Band tone="apricot">
        <Container className="grid gap-8 split:grid-cols-2 split:gap-12">
          <FadeIn>
            <div className="rounded-[2rem] bg-warm-cream p-8 split:p-10">
              <h2 className="text-lg font-bold text-warm-ink">Confirmation Details</h2>

              {reservationId ? (
                <>
                  <div className="mt-6 space-y-4">
                    <div>
                      <dt className="text-sm font-semibold uppercase tracking-wide text-warm-muted">
                        Confirmation Number
                      </dt>
                      <dd className="mt-2 font-mono text-2xl font-bold text-warm-ink">
                        {reservationId}
                      </dd>
                    </div>
                  </div>

                  <p className="mt-6 text-base text-warm-muted">
                    Please save your confirmation number for your records. You'll need it for check-in.
                  </p>
                </>
              ) : (
                <p className="mt-6 text-base text-warm-muted">
                  Your booking has been confirmed. Please check your email for your confirmation
                  number and booking details.
                </p>
              )}

              <div className="mt-8 border-t-2 border-warm-cream pt-8">
                <h3 className="font-semibold text-warm-ink">What's next?</h3>
                <ul className="mt-4 space-y-3 text-base text-warm-muted">
                  <li className="flex gap-3">
                    <span className="text-sun">✓</span>
                    <span>Check your email for the confirmation message</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sun">✓</span>
                    <span>Review your check-in instructions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sun">✓</span>
                    <span>Add our contact number to your phone</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sun">✓</span>
                    <span>Arrive at your scheduled check-in time</span>
                  </li>
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="rounded-[2rem] bg-warm-cream p-8 split:p-10">
              <h2 className="text-lg font-bold text-warm-ink">Need Help?</h2>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-warm-ink">Frequently Asked Questions</h3>
                  <p className="mt-2 text-base text-warm-muted">
                    Check your confirmation email for answers to common questions about your stay.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-warm-ink">Contact Us</h3>
                  <p className="mt-2 text-base text-warm-muted">
                    If you have any questions before your arrival, don't hesitate to reach out to
                    our team.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button href="/contact" tone="sun" size="sm">
                    Contact us
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Band>

      <Band tone="cream">
        <Container className="text-center">
          <FadeIn className="mx-auto max-w-[50ch]">
            <h2 className="text-2xl font-bold text-warm-ink">Explore more properties</h2>
            <p className="mt-4 text-base text-warm-muted">
              Interested in exploring other properties for future stays?
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/stays/" tone="forest">
                Browse properties
              </Button>
              <Button href="/" tone="cream" className="text-warm-ink">
                Back to home
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
