import Image from 'next/image'
import { SearchBar } from '@/components/SearchBar'
import { FadeIn } from '@/components/FadeIn'

export function HeroSearch() {
  return (
    <div className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-forest-warm text-warm-cream">
      <Image
        src="/HeroImage.jpg"
        alt="Mount Washington alpine landscape"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover photo-warm"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 tile-shade"
      />

      <div className="mx-auto w-full max-w-[75rem] px-4 py-24">
        <FadeIn className="text-center">
          <h1 className="type-display text-[clamp(3rem,8vw,6rem)] text-balance">
            Your mountain escape.
            <br />
            Book direct. Save more.
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-[1.1875rem]/[1.5] text-warm-cream/90">
            Experience Mount Washington from our thoughtfully managed vacation
            rentals. Best rates guaranteed when you book directly with us.
          </p>
        </FadeIn>

        <div className="mt-12">
          <SearchBar />
        </div>
      </div>
    </div>
  )
}
