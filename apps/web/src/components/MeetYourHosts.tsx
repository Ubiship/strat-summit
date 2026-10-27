import Image from 'next/image'
import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { site } from '@/lib/site'

export function MeetYourHosts() {
  return (
    <Band>
      <Container>
        <div className="grid items-center gap-12 split:grid-cols-2 split:gap-20">
          {/* Photo */}
          <FadeIn>
            <div className="relative aspect-[5/6] overflow-hidden rounded-[2.5rem] bg-sand">
              <Image
                src={site.images.hosts}
                alt="Joel and Amanda on a mountain trail at sunset"
                fill
                sizes="(min-width: 56.25rem) 36rem, 100vw"
                className="object-cover photo-grade"
              />
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn className="split:order-first">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-forest-warm">
              Meet your hosts
            </p>
            <h2 className="mt-5 type-display text-[clamp(2.5rem,5vw,3.5rem)] text-warm-ink">
              {/* The client dislikes Fraunces' looping ampersand */}
              Joel <span className="font-sans font-semibold">&amp;</span> Amanda
            </h2>
            <div className="mt-10 space-y-6 text-[1.0625rem]/[1.75] text-warm-muted">
              <p>
                A chance meeting while backpacking through Europe more than 16
                years ago grew into a life built around adventure and
                hospitality. Our careers have taken us from wilderness guiding
                to eight seasons at an internationally acclaimed luxury
                wilderness lodge on Vancouver Island, where we learned how
                thoughtful details and personal service shape a memorable stay.
              </p>
              <p>
                Today, Mount Washington is home. Through Strathcona Summit
                Solutions, we&apos;re personally involved in caring for the
                homes you stay in and helping you make the most of your time
                here.
              </p>
              <p>
                Whether you&apos;re here for adventure or a few quiet days in
                the mountains, we look forward to welcoming you.
              </p>
            </div>
            <div className="mt-12">
              <Button href="/about" tone="forest" arrow>
                More about us
              </Button>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Band>
  )
}
