import Image from 'next/image'

export function PhotoBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="relative isolate h-[min(70vh,40rem)] overflow-hidden rounded-t-[var(--band-radius)] hero-cap">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="-z-20 object-cover photo-grade"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 band-shade" />
    </section>
  )
}
