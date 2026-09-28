import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Kicker } from '@/components/Kicker'
import { Offices } from '@/components/Offices'

export function ContactSection() {
  return (
    <Band tone="sun">
      <Container className="grid gap-10 split:grid-cols-[1.3fr_0.7fr] split:items-end">
        <FadeIn>
          <h2 className="max-w-[12ch] type-display text-[clamp(3.25rem,6vw,5.5rem)] text-balance">
            Ready to simplify property ownership?
          </h2>
          <p className="mt-5 max-w-[38ch] text-[1.1875rem]/[1.5] text-[#4a2f14]">
            Whether you&apos;re looking for property management, local property
            support, or renovation services, we&apos;d love to learn more about
            your property and how we can help.
          </p>
          <Button href="/contact" tone="forest" arrow className="mt-8">
            Contact us
          </Button>
        </FadeIn>
        <FadeIn className="rounded-[2.5rem] bg-warm-cream p-7.5">
          <Kicker as="h3">Service area</Kicker>
          <Offices className="mt-4" />
        </FadeIn>
      </Container>
    </Band>
  )
}
