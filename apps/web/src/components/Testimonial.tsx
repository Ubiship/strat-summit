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
    <Band tone="apricot">
      <Container>
        <FadeIn>
          <figure className="mx-auto max-w-4xl">
            <blockquote className="type-display text-[clamp(2.25rem,4.5vw,3.75rem)]/[1.02] text-balance">
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
                <p className="text-lg font-bold">— {client.name}</p>
              )}
            </figcaption>
          </figure>
        </FadeIn>
      </Container>
    </Band>
  )
}
