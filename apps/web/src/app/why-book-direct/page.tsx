import { type Metadata } from 'next'
import { CalendarCheck, MapPin, MessageCircle, Plus, Tag } from 'lucide-react'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { GuestReviews } from '@/components/GuestReviews'
import { PageHero } from '@/components/PageHero'
import { PropertiesCta } from '@/components/PropertiesCta'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import iconLocalSupport from '@/images/icons/icon-local-support.png'
import iconSecurePayment from '@/images/icons/icon-secure-payment.png'
import iconVerifiedProperties from '@/images/icons/icon-verified-properties.png'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Why Book Direct',
  description:
    'Book directly with Strathcona Summit for best rates guaranteed, direct communication with local hosts, and a clear 30-day cancellation policy.',
}

const benefits = [
  {
    title: 'Best rate guarantee',
    icon: Tag,
    description:
      'No third-party booking fees means more savings for you. Our direct rates are always the lowest available — if you find a lower price elsewhere, we will match it.',
  },
  {
    title: 'Direct communication',
    icon: MessageCircle,
    description:
      'Connect directly with local property managers who know Mount Washington inside out. Get faster responses, personalized recommendations, and support throughout your stay.',
  },
  {
    title: 'Clear cancellation',
    icon: CalendarCheck,
    description:
      'A straightforward 30-day policy: a full refund if you cancel 30 or more days before arrival, 50% between 7 and 29 days, and no refund within 7 days of arrival.',
  },
  {
    title: 'Local hosts',
    icon: MapPin,
    description:
      'Based on Mount Washington, we provide insider tips on the best trails, dining spots, and hidden gems that only locals know about.',
  },
]

const securityPoints = [
  {
    title: 'Secure Payment Processing',
    icon: iconSecurePayment,
    description:
      'Industry-standard encryption and secure payment processing protect your financial information.',
  },
  {
    title: 'Verified Properties',
    icon: iconVerifiedProperties,
    description:
      'Every property is personally inspected and managed by our team — no surprises when you arrive.',
  },
  {
    title: 'Local Support',
    icon: iconLocalSupport,
    description:
      'Real people available to help during your stay, not offshore call centers or chatbots.',
  },
]

const faqs = [
  {
    question: 'How do I know booking direct is safe?',
    answer:
      'We use industry-standard secure payment processing and all our properties are personally managed by our local team. You can verify our business registration and read reviews from past guests.',
  },
  {
    question: 'What if I need to cancel or change my booking?',
    answer:
      'Our cancellation policy is simple: cancel 30 or more days before arrival for a full refund, 7 to 29 days before for a 50% refund. Cancellations within 7 days of arrival are non-refundable. Contact us as soon as your plans change.',
  },
  {
    question: 'Do you offer the same properties as Airbnb or VRBO?',
    answer:
      'Many of our properties are also listed on third-party platforms, but booking direct gives you better rates and direct service without the platform fees.',
  },
  {
    question: 'How do I pay when booking direct?',
    answer:
      'We accept all major credit cards through our secure payment system. You will receive email confirmation and detailed booking information immediately after payment.',
  },
  {
    question: 'What if I have questions during my stay?',
    answer:
      'Our local team is available by phone, text, or email during your stay. As local hosts, we can respond quickly to any questions or issues that come up.',
  },
]

export default function WhyBookDirect() {
  return (
    <RootLayout>
      <PageHero
        kicker="Book with confidence"
        title="Why book direct with us?"
        image={{
          src: site.images.hero,
          alt: 'Snow-capped mountain peak above Vancouver Island forest',
          position: 'center 35%',
        }}
      >
        <p>
          Skip the booking fees, get better rates, and connect directly with
          local hosts who know Mount Washington. Here is why booking direct is
          the smarter choice.
        </p>
      </PageHero>

      <Band tone="white">
        <Container>
          <SectionHead kicker="Benefits" title="What you get when you book direct.">
            <p>
              Direct bookings mean better value, clear policies, and
              personalized service from start to finish.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-14 grid gap-5 split:mt-20 split:grid-cols-2">
            {benefits.map(({ title, icon: Icon, description }) => (
              <FadeIn
                key={title}
                className="flex flex-col rounded-[1.5rem] border border-line bg-white p-8 split:p-10"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-6 text-accent"
                />
                <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                  {title}
                </h3>
                <p className="mt-2 max-w-[48ch] text-base/[1.6] text-muted">
                  {description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <GuestReviews />

      <Band tone="mist">
        <Container>
          <SectionHead kicker="Security" title="Safe and secure booking.">
            <p>
              We take the security of your personal and payment information
              seriously. Here is how we keep your booking safe.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-14 grid gap-5 split:mt-20 split:grid-cols-3">
            {securityPoints.map((point) => (
              <FadeIn
                key={point.title}
                className="flex flex-col rounded-[1.5rem] border border-line bg-white p-8"
              >
                <CardIcon src={point.icon} size="sm" />
                <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-base/[1.6] text-muted">
                  {point.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band tone="white">
        <Container className="grid gap-14 split:grid-cols-[0.8fr_1.2fr] split:gap-20">
          <SectionHead kicker="Questions" title="Booking direct, answered.">
            <p>
              Still have questions? Reach out anytime at{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-medium text-accent underline decoration-accent/30 decoration-1 underline-offset-4 transition hover:text-accent-deep hover:decoration-accent"
              >
                {site.contactEmail}
              </a>
            </p>
          </SectionHead>
          <FadeIn>
            <div className="border-t border-line">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-line"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-7 text-[1.1875rem]/[1.4] font-semibold tracking-[-0.015em] text-ink transition hover:text-accent [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <Plus
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="mt-0.5 size-5 flex-none text-accent transition-transform duration-200 group-open:rotate-45"
                    />
                  </summary>
                  <p className="-mt-2 max-w-[60ch] pb-7 text-base/[1.65] text-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </FadeIn>
        </Container>
      </Band>

      <PropertiesCta audience="guests" />
    </RootLayout>
  )
}
