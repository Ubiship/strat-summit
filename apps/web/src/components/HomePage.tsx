import Link from 'next/link'
import {
  HeartHandshake,
  MapPin,
  Snowflake,
  Sun,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { EntrySplash } from '@/components/EntrySplash'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { FAQ } from '@/components/FAQ'
import { HeroWithSearch } from '@/components/HeroWithSearch'
import { MeetYourHosts } from '@/components/MeetYourHosts'
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

const contentCategories = [
  {
    title: 'Winter Activities',
    href: '/mount-washington/category/winter',
    icon: Snowflake,
    description:
      'Discover skiing, snowshoeing, tubing, and more ways to enjoy the snow.',
    linkText: 'Explore winter activities',
  },
  {
    title: 'Summer Activities',
    href: '/mount-washington/category/summer',
    icon: Sun,
    description:
      'Explore hiking trails, mountain biking, lakes, and adventures beyond the mountain.',
    linkText: 'Explore summer activities',
  },
  {
    title: 'Where to Eat',
    href: '/mount-washington/category/dining',
    icon: UtensilsCrossed,
    description:
      'Find local restaurants, cafes, and favourite spots on the mountain and in the Comox Valley.',
    linkText: 'Explore places to eat',
  },
]

// Images are placeholders until final photography.
const bookDirectFeatures: Feature[] = [
  {
    title: 'Better value',
    icon: Wallet,
    description:
      'Skip third-party booking fees and put more of your budget towards your mountain getaway.',
    image: { src: '/HeroImage.jpg', alt: 'Mount Washington above the forest' },
  },
  {
    title: 'Personal service',
    icon: HeartHandshake,
    description:
      'From your first question to your final morning, connect directly with our team for thoughtful, attentive support.',
    image: { src: '/PropertyManagment.png', alt: 'House keys on a table' },
  },
  {
    title: 'Local knowledge',
    icon: MapPin,
    description:
      "From mountain adventures to favourite local spots, we'll help you make the most of your time here.",
    image: { src: '/Renos.png', alt: 'A home being prepared for guests' },
  },
]

function ContentHub() {
  return (
    <Band tone="white">
      <Container>
        <SectionHead kicker="Mt Washington Info" title="Your guide to the mountain.">
          <p>
            Explore Mount Washington, Strathcona Provincial Park, and the Comox
            Valley through seasonal adventures and places to eat.
          </p>
        </SectionHead>

        <FadeInStagger className="mt-14 grid gap-5 split:mt-16 split:grid-cols-3">
          {contentCategories.map(({ icon: Icon, ...category }) => (
            <FadeIn
              key={category.title}
              className="group relative flex flex-col rounded-[1.5rem] border border-line bg-white p-8 transition hover:border-accent/40"
            >
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-7 text-accent"
              />
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
                {category.linkText} →
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
            title="Book direct. Feel right at home."
            intro={
              <p>
                Book your Mount Washington getaway with local hosts who care
                for every detail of your stay.{' '}
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
        <MeetYourHosts />
        <ContentHub />
        <FAQ />
        <PropertiesCta audience="owners" />
      </RootLayout>
    </>
  )
}
