import Image from 'next/image'
import { Band } from '@/components/Band'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export function MeetYourHosts() {
  return (
    <Band>
      <Container>
        <div className="grid items-center gap-12 split:grid-cols-2 split:gap-20">
          {/* Photo */}
          <FadeIn>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[3rem] bg-warm-ink/5 shadow-[0_8px_32px_rgb(22_56_38/0.1)]">
              {/* Placeholder until photo is added */}
              <div className="absolute inset-0 flex items-center justify-center text-warm-ink/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  className="size-28"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              {/* Uncomment and update src when photo is ready:
              <Image
                src="/hosts-joel-amanda.jpg"
                alt="Joel and Amanda, your hosts at Strathcona Summit Solutions"
                fill
                sizes="(min-width: 960px) 50vw, 100vw"
                className="object-cover"
              />
              */}
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
