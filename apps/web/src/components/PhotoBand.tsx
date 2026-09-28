import Image from 'next/image'

export function PhotoBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="relative z-10 mt-[calc(var(--band-radius)*-1)] h-[min(70vh,40rem)] overflow-hidden rounded-t-[var(--band-radius)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover photo-warm"
      />
    </section>
  )
}
