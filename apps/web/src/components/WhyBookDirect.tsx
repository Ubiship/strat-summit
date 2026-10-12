import Link from 'next/link'
import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'

function IconBetterValue({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 38V22l12-12 12 12v16a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2Z" />
      <path d="M20 40v-12h8v12" />
      <circle cx="24" cy="22" r="3" />
    </svg>
  )
}

function IconPersonalService({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M24 42s-14-8.35-14-19a10 10 0 0 1 14-9.17A10 10 0 0 1 38 23c0 10.65-14 19-14 19Z" />
    </svg>
  )
}

function IconLocalKnowledge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M24 26c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6Z" />
      <path d="M24 6c-9.941 0-18 8.059-18 18 0 12 18 20 18 20s18-8 18-20c0-9.941-8.059-18-18-18Z" />
    </svg>
  )
}

const benefits = [
  {
    title: 'Better value',
    Icon: IconBetterValue,
    description:
      'Skip third-party booking fees and put more of your budget towards your mountain getaway.',
  },
  {
    title: 'Personal service',
    Icon: IconPersonalService,
    description:
      'From your first question to your final morning, connect directly with our team for thoughtful, attentive support.',
  },
  {
    title: 'Local knowledge',
    Icon: IconLocalKnowledge,
    description:
      "From mountain adventures to favourite local spots, we'll help you make the most of your time here.",
  },
]

export function WhyBookDirect() {
  return (
    <Band tone="cream">
      <Container>
        <SectionHead kicker="Why book direct" title="Book direct. Feel right at home.">
          <p>
            Book your Mount Washington getaway with local hosts who care for
            every detail of your stay.{' '}
            <Link
              href="/stays"
              className="font-bold text-forest-warm underline decoration-2 underline-offset-2 transition hover:text-forest-deep"
            >
              Check availability
            </Link>
          </p>
        </SectionHead>

        <FadeInStagger className="mt-20 grid gap-8 split:grid-cols-3 split:gap-8">
          {benefits.map((benefit) => (
            <FadeIn
              key={benefit.title}
              className="flex flex-col rounded-[3rem] bg-white p-10 shadow-[0_8px_32px_rgb(42_24_10/0.06),0_2px_8px_rgb(42_24_10/0.03)] split:p-12"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-forest-warm/8">
                <benefit.Icon className="size-10 text-forest-warm" />
              </div>
              <h3 className="mt-10 type-display text-[clamp(2rem,3vw,2.375rem)] text-warm-ink">
                {benefit.title}
              </h3>
              <p className="mt-5 text-[1.0625rem]/[1.7] text-warm-muted">
                {benefit.description}
              </p>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}
