import Link from 'next/link'
import { CalendarCheck, MapPin, Tag } from 'lucide-react'

import { Band } from '@/components/Band'
import { CardIcon } from '@/components/CardIcon'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { HeroWithSearch } from '@/components/HeroWithSearch'
import { PropertiesCta } from '@/components/PropertiesCta'
import { PropertyShowcase } from '@/components/PropertyShowcase'
import { GuestReviews } from '@/components/GuestReviews'
import { RootLayout } from '@/components/RootLayout'
import { SectionHead } from '@/components/SectionHead'
import {
  ThreeColumnFeaturesWithImage,
  type Feature,
} from '@/components/ui/three-column-features-with-image'
import { WhyBookDirect } from '@/components/WhyBookDirect'
import iconActivities from '@/images/icons/icon-activities.png'
import iconDining from '@/images/icons/icon-dining.png'
import iconPlanning from '@/images/icons/icon-planning.png'

const contentCategories = [
  {
    title: 'Activities',
    href: '/mount-washington/activities',
    icon: iconActivities,
    description:
      'Skiing, snowboarding, hiking, and mountain biking—discover year-round adventures on Mount Washington.',
  },
  {
    title: 'Planning',
    href: '/mount-washington/planning',
    icon: iconPlanning,
    description:
      'Weather guides, packing lists, and local tips to help you plan the perfect mountain getaway.',
  },
  {
    title: 'Dining',
    href: '/mount-washington/dining',
    icon: iconDining,
    description:
      'Find the best restaurants, cafes, and mountain dining experiences near your rental property.',
  },
]

// The four "why book direct" benefits, with direct communication and local
// hosts folded together. Images are placeholders until final photography.
const bookDirectFeatures: Feature[] = [
  {
    title: 'Best rate guarantee',
    icon: Tag,
    description:
      'No third-party booking fees. Our direct rates are always the best available, and booking with us means more of your budget goes to the mountain.',
    image: { src: '/HeroImage.jpg', alt: 'Mount Washington above the forest' },
  },
  {
    title: 'Local hosts, one conversation',
    icon: MapPin,
    description:
      'We live and work on Mount Washington. Talk directly to the team managing your stay for recommendations and quick answers, before you arrive and while you are here.',
    image: { src: '/PropertyManagment.png', alt: 'House keys on a table' },
  },
  {
    title: 'Clear cancellation',
    icon: CalendarCheck,
    description:
      'A straightforward 30-day policy on every booking, with winter conditions spelled out, so you always know exactly where you stand.',
    image: { src: '/Renos.png', alt: 'A home being prepared for guests' },
  },
]

function ContentHub() {
  return (
    <Band tone="white">
      <Container>
        <SectionHead kicker="Mt Washington Info" title="Your guide to the mountain.">
          <p>
            Local guides and insider tips to help you make the most of your
            time on Mount Washington.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-3">
          {contentCategories.map((category) => (
            <FadeIn
              key={category.title}
              className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40"
            >
              <CardIcon src={category.icon} size="sm" />
              <h3 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em]">
                <Link href={category.href} className="after:absolute after:inset-0">
                  {category.title}
                </Link>
              </h3>
              <p className="mt-2 flex-auto text-base/[1.6] text-muted">
                {category.description}
              </p>
              <p
                aria-hidden="true"
                className="mt-6 text-[0.9375rem] font-medium text-accent"
              >
                Explore {category.title.toLowerCase()} →
              </p>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </Band>
  )
}

// Two homepage directions for client review. Both share every section; they
// differ only in how much the hero photo and the accent colour lead.
export function HomePage({ option }: { option: 'a' | 'b' }) {
  return (
    <>
      <EntrySplash />
      <RootLayout>
        <HeroWithSearch option={option} />
        {option === 'a' && (
          <ThreeColumnFeaturesWithImage
            kicker="Why book direct"
            title="More value. Better service."
            intro={
              <p>
                Book with us directly for the best rates, personal service,
                and a team that lives on the mountain.{' '}
                <Link
                  href="/why-book-direct"
                  className="font-medium text-accent underline decoration-1 underline-offset-4 transition hover:text-accent-deep"
                >
                  Learn more
                </Link>
              </p>
            }
            features={bookDirectFeatures}
          />
        )}
        <GuestReviews />
        <PropertyShowcase />
        {option === 'b' && <WhyBookDirect tone="accent" />}
        <ContentHub />
        <PropertiesCta audience="owners" />
      </RootLayout>
    </>
  )
}
