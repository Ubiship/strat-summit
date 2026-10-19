import { Suspense } from 'react'
import Image from 'next/image'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SearchBar } from '@/components/SearchBar'
import { HeroWithBackground } from '@/components/ui/hero-with-background'

const title = 'Stay close to adventure. Settle into comfort.'
const intro =
  'Discover Mount Washington chalets and condos, thoughtfully prepared and hosted by a local team who know and love the mountain.'

function Search({ className }: { className?: string }) {
  return (
    <Suspense fallback={<div className="h-[4.5rem]" />}>
      <SearchBar className={className} />
    </Suspense>
  )
}

// Option A: the framed hero with the photo fading into white; search follows.
function WhiteHero() {
  return (
    <>
      <HeroWithBackground
        title={title}
        intro={intro}
        image={{ src: '/HeroImage.jpg', alt: 'Mount Washington alpine landscape' }}
        primaryAction={{ label: 'Find your stay', href: '/stays' }}
        secondaryAction={{ label: 'Mt Washington Info', href: '/mount-washington' }}
      />
      <section className="bg-white pt-6 split:pt-8">
        <Container>
          <FadeIn>
            <Search className="mx-auto max-w-4xl" />
          </FadeIn>
        </Container>
      </section>
    </>
  )
}

// Option B: the photo leads, framed with a margin so the page stays white
// around it; the search bar overlaps its lower edge.
function PhotoHero() {
  return (
    <section className="bg-white px-3 pt-3 split:px-5 split:pt-5">
      <div className="relative isolate mx-auto flex min-h-[min(48rem,88svh)] max-w-[90rem] flex-col justify-end overflow-hidden rounded-[2rem] text-white">
        <Image
          src="/HeroImage.jpg"
          alt="Mount Washington alpine landscape"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 photo-scrim" />
        <Container className="pb-32 split:pb-36">
          <FadeIn className="max-w-3xl">
            <h1 className="type-display text-[clamp(3rem,7vw,5.75rem)] text-balance">
              {title}
            </h1>
            <p className="mt-6 max-w-[44ch] text-[1.1875rem]/[1.5] text-white/85">
              {intro}
            </p>
          </FadeIn>
        </Container>
      </div>
      <Container className="relative -mt-12">
        <Search className="mx-auto max-w-4xl" />
      </Container>
    </section>
  )
}

export function HeroWithSearch({ option = 'a' }: { option?: 'a' | 'b' }) {
  return option === 'a' ? <WhiteHero /> : <PhotoHero />
}
