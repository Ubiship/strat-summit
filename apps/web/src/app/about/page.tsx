import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Band } from '@/components/Band'
import { cardClasses } from '@/components/Card'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { PageHero } from '@/components/PageHero'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet Joel and Amanda, the people behind Strathcona Summit on Mount Washington.',
}

const founders = [
  {
    name: 'Joel Macmillan',
    role: 'Co-Founder | Growth & Client Relationships',
    image: site.images.joel,
    // Head-and-shoulders frame; keep his face in the upper half of the crop.
    position: 'center 32%',
    bio: [
      'Joel’s work has taken him from framing custom homes in Alberta to leading sea kayaking expeditions and managing marine operations at a luxury wilderness lodge outside Tofino. At Strathcona Summit, he leads business growth and works directly with property owners. When a home needs repairs or updates, Joel helps owners work through their options and takes a hands-on role in seeing the project through.',
      'Outside work, you’ll likely find him skiing, fishing, hunting, or planning his next backcountry adventure.',
    ],
  },
  {
    name: 'Amanda Warren',
    role: 'Co-Founder | Operations & Guest Services',
    image: site.images.amanda,
    position: 'center 28%',
    bio: [
      'Amanda’s background spans wilderness guiding, luxury hospitality, and the day-to-day work of running a remote lodge. At Strathcona Summit, she oversees daily operations and guest communications, coordinating the work that goes into getting each home ready and making sure guests have the information they need before they arrive.',
      'Outside work, you’ll likely find her exploring Mount Washington’s trails with her dog pack or planning her next camping trip.',
    ],
  },
]

export default function About() {
  return (
    <RootLayout>
      <PageHero kicker="About us" title="Meet Joel & Amanda">
        <p className="text-[clamp(1.375rem,2.2vw,1.625rem)]/[1.4] text-warm-ink">
          The path to Mount Washington wasn’t exactly a straight line.
        </p>
      </PageHero>

      <Band>
        <Container>
          <div className="grid items-center gap-12 split:grid-cols-2 split:gap-20">
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
            <FadeIn className="space-y-6 text-[1.1875rem]/[1.7] text-pretty text-warm-muted split:order-first">
              <p>
                We met more than 20 years ago while backpacking through Europe.
                Our shared love of travel and adventure took us all over the
                world, and along the way we built careers in hospitality and
                adventure guiding. That work eventually brought us to a luxury
                wilderness lodge outside Tofino, where we spent eight seasons
                working in guiding, guest services, marine operations, and
                property care.
              </p>
              <p>
                Working at a remote lodge taught us what it takes to make people
                feel welcome and how much happens behind the scenes to make a
                stay feel effortless. We learned to keep a property running day
                to day and handle the unexpected while making sure guests felt
                looked after.
              </p>
              <p>
                Today, we call Mount Washington home. We started Strathcona
                Summit to put that experience to work here on the mountain. Our
                roots in hospitality shape how our team manages each home and
                keeps owners informed. For guests, that care starts with knowing
                what to expect before they arrive and continues when they walk
                through the door of a home that’s ready for them.
              </p>
            </FadeIn>
          </div>
        </Container>
      </Band>

      <Band>
        <Container>
          <FadeInStagger>
            <SectionHead title="The People Behind Strathcona Summit" />
            <ul role="list" className="mt-14 grid gap-6 split:grid-cols-2">
              {founders.map((person) => (
                <li key={person.name}>
                  <FadeIn
                    className={clsx(
                      cardClasses({ tone: 'tint' }),
                      'h-full overflow-hidden',
                    )}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={person.image}
                        alt=""
                        fill
                        sizes="(min-width: 56.25rem) 36rem, 100vw"
                        className="object-cover photo-grade"
                        style={{ objectPosition: person.position }}
                      />
                    </div>
                    <div className="p-8 split:p-10">
                      <h3 className="type-display text-[2.625rem]">
                        {person.name}
                      </h3>
                      <p className="mt-2 text-[1.0625rem] font-semibold text-forest-warm">
                        {person.role}
                      </p>
                      <div className="mt-6 space-y-4 text-[1.0625rem]/[1.7] text-pretty text-warm-muted">
                        {person.bio.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </FadeInStagger>
        </Container>
      </Band>

      <ContactSection title="Let’s talk about your mountain home.">
        Looking for local property management on Mount Washington? Tell us a
        little about your home and what you’re looking for. We’d love to hear
        from you.
      </ContactSection>
    </RootLayout>
  )
}
