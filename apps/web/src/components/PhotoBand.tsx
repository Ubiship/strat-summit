import Image from 'next/image'

import { Container } from '@/components/Container'

export function PhotoBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="bg-white">
      <Container>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] split:aspect-[21/9]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 75rem) 72rem, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  )
}
