'use client'

import { useState } from 'react'
import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { SectionHead } from '@/components/SectionHead'
import clsx from 'clsx'

const faqs = [
  {
    question: 'What time are check-in and checkout?',
    answer: (
      <p>
        Check-in is from 4:00 PM and checkout is by 11:00 AM. If you&apos;d like
        an earlier arrival or later departure, please contact us. Requests
        depend on availability and must be confirmed in advance.
      </p>
    ),
  },
  {
    question: 'Is parking included?',
    answer: (
      <p>
        Yes—all our properties include free parking, but spaces are limited. The
        number of vehicles permitted and any parking registration requirements
        vary by property. Please check the property listing before booking and
        follow the parking instructions provided for your stay.
      </p>
    ),
  },
  {
    question: 'Are pets allowed?',
    answer: (
      <p>
        Pet policies vary by property. Please check the individual listing
        before booking, or contact us if you&apos;re unsure.
      </p>
    ),
  },
  {
    question: 'What is your cancellation policy?',
    answer: (
      <div className="space-y-4">
        <p>
          We have a 30-day cancellation policy on all bookings. Cancellations
          made at least 30 days before your arrival date receive a full refund.
          Cancellations made fewer than 30 days but at least 7 days before your
          arrival date receive a 50% refund. Cancellations made fewer than 7
          days before your arrival date receive no refund.
        </p>
        <p className="font-semibold text-warm-ink">
          Winter Conditions and Cancellation
        </p>
        <p>
          Our standard cancellation policy applies throughout the winter season.
          Refunds, credits, or date changes are not provided due to snowfall,
          snow quality, weather conditions, limited terrain, or partial mountain
          operations.
        </p>
        <p>
          If Mount Washington Alpine Resort closes all mountain operations
          specifically due to insufficient snow, we will consider affected
          reservations for a refund or credit.
        </p>
        <p>
          If any portion of the mountain remains operational, including Nordic,
          beginner terrain, or limited alpine terrain, the standard cancellation
          policy remains in effect.
        </p>
      </div>
    ),
  },
  {
    question: 'How will I receive directions and check-in instructions?',
    answer: (
      <p>
        Before your arrival, we&apos;ll send you a digital guest guide with
        directions, property information, and helpful details for your stay.
        Your access code will be sent separately on the day of arrival.
      </p>
    ),
  },
]

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-warm-ink/10">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-7 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[1.125rem] font-semibold leading-snug text-warm-ink">{question}</span>
        <span
          className={clsx(
            'flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-warm/8 text-forest-warm transition-transform duration-300',
            isOpen && 'rotate-45 bg-forest-warm text-warm-cream',
          )}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="size-4"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </span>
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-8 text-[1.0625rem]/[1.75] text-warm-muted">
            {answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Band tone="white">
      <Container>
        <SectionHead kicker="FAQs" title="Frequently asked questions.">
          <p>A few helpful details before you book your mountain stay.</p>
        </SectionHead>

        <FadeIn className="mt-16 max-w-3xl split:mt-20">
          <div className="border-t border-warm-ink/10">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mt-16 max-w-3xl">
          <p className="text-[1.125rem] text-warm-muted">
            Still have a question? We&apos;re happy to help.
          </p>
          <div className="mt-8">
            <Button href="/contact" tone="forest" arrow>
              Contact us
            </Button>
          </div>
        </FadeIn>
      </Container>
    </Band>
  )
}
