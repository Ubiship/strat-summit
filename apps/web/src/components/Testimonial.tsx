import Image, { type ImageProps } from 'next/image'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export function Testimonial({
  children,
  client,
}: {
  children: React.ReactNode
  client: { logo?: ImageProps['src'] | null; name: string }
}) {
  return (
    <Band tone="mist">
      <Container>
        <FadeIn>
          <figure className="mx-auto max-w-4xl">
            <blockquote className="text-[clamp(1.75rem,3.5vw,2.75rem)]/[1.2] font-semibold tracking-[-0.03em] text-balance">
              <p>
                <span aria-hidden="true">“</span>
                {children}
                <span aria-hidden="true">”</span>
              </p>
            </blockquote>
            <figcaption className="mt-10">
              {client.logo ? (
                <Image src={client.logo} alt={client.name} unoptimized />
              ) : (
                <p className="text-base font-semibold text-accent">— {client.name}</p>
              )}
            </figcaption>
          </figure>
        </FadeIn>
      </Container>
    </Band>
  )
}
