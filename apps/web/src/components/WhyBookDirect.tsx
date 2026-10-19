import Link from 'next/link'
import clsx from 'clsx'
import { HeartHandshake, MapPin, Wallet } from 'lucide-react'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'

const benefits = [
  {
    title: 'Better value',
    icon: Wallet,
    description:
      'Skip third-party booking fees and put more of your budget towards your mountain getaway.',
  },
  {
    title: 'Personal service',
    icon: HeartHandshake,
    description:
      'From your first question to your final morning, connect directly with our team for thoughtful, attentive support.',
  },
  {
    title: 'Local knowledge',
    icon: MapPin,
    description:
      "From mountain adventures to favourite local spots, we'll help you make the most of your time here.",
  },
]

// The accent tone is the one place on the homepage where colour fills a whole
// section; the mist tone keeps the page almost entirely white.
export function WhyBookDirect({ tone = 'mist' }: { tone?: 'mist' | 'accent' }) {
  let dark = tone === 'accent'

  return (
    <Band tone={tone}>
      <Container>
        <SectionHead
          kicker="Why book direct"
          title="Book direct. Feel right at home."
          tone={dark ? 'dark' : 'light'}
        >
          <p>
            Book your Mount Washington getaway with local hosts who care for
            every detail of your stay.{' '}
            <Link
              href="/why-book-direct"
              className={clsx(
                'font-medium underline decoration-1 underline-offset-4 transition',
                dark ? 'text-white hover:decoration-2' : 'text-accent hover:text-accent-deep',
              )}
            >
              Learn more
            </Link>
          </p>
        </SectionHead>

        <FadeInStagger className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 split:mt-20 split:grid-cols-3">
          {benefits.map(({ title, icon: Icon, description }) => (
            <FadeIn key={title}>
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className={clsx('size-7', dark ? 'text-highlight' : 'text-accent')}
              />
              <h3 className="mt-5 text-[1.1875rem] font-semibold tracking-[-0.015em]">
                {title}
              </h3>
              <p
                className={clsx(
                  'mt-2 text-base/[1.6]',
                  dark ? 'text-white/75' : 'text-muted',
                )}
              >
                {description}
              </p>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}
