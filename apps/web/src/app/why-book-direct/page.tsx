import { type Metadata } from 'next'
import Image from 'next/image'

import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import iconBestPrice from '@/images/benefits/icon-best-price.jpg'
import iconDirectCommunication from '@/images/benefits/icon-direct-communication.jpg'
import iconFlexibleCancellation from '@/images/benefits/icon-flexible-cancellation.jpg'
import iconLocalHosts from '@/images/benefits/icon-local-hosts.jpg'
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
    title: 'Best Price Guarantee',
    icon: iconBestPrice,
    description:
      'No third-party booking fees means more savings for you. Our direct rates are always the lowest available — if you find a lower price elsewhere, we will match it.',
  },
  {
    title: 'Direct Communication',
    icon: iconDirectCommunication,
    description:
      'Connect directly with local property managers who know Mount Washington inside out. Get faster responses, personalized recommendations, and support throughout your stay.',
  },
  {
    title: 'Clear Cancellation',
    icon: iconFlexibleCancellation,
    description:
      'A straightforward 30-day policy: a full refund if you cancel 30 or more days before arrival, 50% between 7 and 29 days, and no refund within 7 days of arrival.',
  },
  {
    title: 'Local Hosts',
    icon: iconLocalHosts,
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
        }}
      >
        <p>
          Skip the booking fees, get better rates, and connect directly with
          local hosts who know Mount Washington. Here is why booking direct is
          the smarter choice.
        </p>
      </PageHero>

      <Band>
        <Container>
          <SectionHead kicker="Benefits" title="What you get when you book direct">
            <p>
              Direct bookings mean better value, clear policies, and
              personalized service from start to finish.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2">
            {benefits.map((benefit) => (
              <FadeIn
                key={benefit.title}
                className="flex flex-col rounded-[2.75rem] bg-white p-10 shadow-[0_8px_24px_rgb(22_56_38/0.06)]"
              >
                <Image
                  src={benefit.icon}
                  alt=""
                  sizes="6rem"
                  className="-ml-2 size-24 flex-none mix-blend-multiply"
                />
                <h3 className="mt-8 type-display text-[2.25rem] text-warm-ink">
                  {benefit.title}
                </h3>
                <p className="mt-4 text-[1.0625rem]/[1.6] text-warm-muted">
                  {benefit.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band>
        <Container>
          <SectionHead kicker="Security" title="Safe and secure booking">
            <p>
              We take the security of your personal and payment information
              seriously. Here is how we keep your booking safe.
            </p>
          </SectionHead>
          <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-3">
            {securityPoints.map((point) => (
              <FadeIn
                key={point.title}
                className="flex flex-col rounded-[2.75rem] bg-warm-cream p-10"
              >
                <CardIcon src={point.icon} />
                <h3 className="mt-8 type-display text-[2rem] text-warm-ink">
                  {point.title}
                </h3>
                <p className="mt-4 text-[1.0625rem]/[1.6] text-warm-muted">
                  {point.description}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band>
        <Container>
          <SectionHead
            kicker="Frequently asked questions"
            title="Common questions about booking direct"
          >
            <p>
              Still have questions? We are here to help. Reach out anytime at{' '}
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-bold text-forest-warm underline decoration-2 underline-offset-2"
              >
                {site.contactEmail}
              </a>
            </p>
          </SectionHead>
          <FadeInStagger className="mt-16 space-y-6">
            {faqs.map((faq) => (
              <FadeIn
                key={faq.question}
                className="rounded-[2.75rem] bg-sand p-10"
              >
                <h3 className="type-display text-[1.875rem] text-warm-ink">
                  {faq.question}
                </h3>
                <p className="mt-4 text-[1.0625rem]/[1.6] text-warm-muted">
                  {faq.answer}
                </p>
              </FadeIn>
            ))}
          </FadeInStagger>
        </Container>
      </Band>

      <Band last>
        <Container className="text-center">
          <FadeIn>
            <h2 className="type-display text-[clamp(2.75rem,5vw,4.25rem)] text-warm-ink">
              Ready to book your stay?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[1.25rem]/[1.55] text-warm-muted">
              Browse our available properties on Mount Washington and book
              direct for the best rates and service.
            </p>
            <div className="mt-12">
              <Button href="/stays" tone="forest" arrow>
                Browse properties
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Band>
    </RootLayout>
  )
}
