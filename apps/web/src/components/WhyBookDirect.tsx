import Image from 'next/image'
import Link from 'next/link'
import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import iconBestPrice from '@/images/benefits/icon-best-price.jpg'
import iconDirectCommunication from '@/images/benefits/icon-direct-communication.jpg'
import iconFlexibleCancellation from '@/images/benefits/icon-flexible-cancellation.jpg'
import iconLocalHosts from '@/images/benefits/icon-local-hosts.jpg'

const benefits = [
  {
    title: 'Best Price Guarantee',
    icon: iconBestPrice,
    description:
      'No third-party booking fees means more savings for you. Our direct rates are always the lowest available.',
  },
  {
    title: 'Direct Communication',
    icon: iconDirectCommunication,
    description:
      'Connect directly with local property managers who know the area and can help make your stay exceptional.',
  },
  {
    title: 'Flexible Cancellation',
    icon: iconFlexibleCancellation,
    description:
      'Book with confidence knowing our flexible cancellation policy protects your travel plans.',
  },
  {
    title: 'Local Hosts',
    icon: iconLocalHosts,
    description:
      'Based on Mount Washington, we provide personalized recommendations and responsive support throughout your stay.',
  },
]

export function WhyBookDirect() {
  return (
    <Band tone="cream">
      <Container>
        <SectionHead kicker="Why book direct" title="More value. Better service.">
          <p>
            When you book directly with us, you get the best rates, personalized
            service, and support from a team that lives and works on Mount
            Washington.{' '}
            <Link
              href="/why-book-direct"
              className="font-bold text-forest-warm underline decoration-2 underline-offset-2 transition hover:text-forest-deep"
            >
              Learn more
            </Link>
          </p>
        </SectionHead>

        <FadeInStagger className="mt-16 grid gap-8 split:grid-cols-2 split:gap-10">
          {benefits.map((benefit) => (
            <FadeIn
              key={benefit.title}
              className="flex flex-col rounded-[2.75rem] bg-white p-10 shadow-[0_8px_24px_rgb(42_24_10/0.06)]"
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
  )
}
