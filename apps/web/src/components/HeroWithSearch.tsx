import Image from 'next/image'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'
import { getBookingSiteUrl } from '@/lib/booking'
import { site } from '@/lib/site'

export function HeroWithSearch() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-forest-warm text-warm-cream hero-cap">
      {/* Background Image */}
      <Image
        src={site.images.homepage}
        alt="Snow-covered Mount Washington, with chalets among the trees and alpine peaks beyond"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover photo-grade"
      />

      {/* Overlay */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 tile-shade" />

      {/* Content */}
      <div className="mx-auto flex w-full max-w-[78rem] flex-1 flex-col px-6 pt-44 pb-[calc(var(--band-radius)+6rem)] split:px-12 split:pt-52">
        <FadeIn className="text-center">
          <h1 className="type-display text-[clamp(2.75rem,7.5vw,5.5rem)] text-balance">
            Stay close to adventure.
            <br />
            Settle into comfort.
          </h1>
          <p className="mx-auto mt-10 max-w-[50ch] text-[1.25rem]/[1.6] text-warm-cream/90">
            Discover Mount Washington chalets and condos, thoughtfully prepared
            and hosted by a local team who know and love the mountain.
          </p>
          <Button
            href={getBookingSiteUrl()}
            tone="light"
            size="lg"
            className="mt-12"
            arrow
          >
            Search availability on our booking portal
          </Button>
        </FadeIn>
      </div>
    </div>
  )
}
