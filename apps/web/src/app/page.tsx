import { type Metadata } from 'next'

import { BookingInvitation } from '@/components/BookingInvitation'
import { ContentHub } from '@/components/ContentHub'
import { EntrySplash } from '@/components/EntrySplash'
import { FAQ } from '@/components/FAQ'
import { HeroWithSearch } from '@/components/HeroWithSearch'
import { MeetYourHosts } from '@/components/MeetYourHosts'
import { PropertyShowcase } from '@/components/PropertyShowcase'
import { ReviewCarousel } from '@/components/ReviewCarousel'
import { RootLayout } from '@/components/RootLayout'
import { WhyBookDirect } from '@/components/WhyBookDirect'

export const metadata: Metadata = {
  description:
    'Book vacation rentals on Mount Washington directly with us. Best rates guaranteed, local hosts, and exceptional mountain experiences.',
}

export default function Home() {
  return (
    <>
      <EntrySplash />
      <RootLayout>
        <HeroWithSearch />
        <PropertyShowcase />
        <WhyBookDirect />
        <ReviewCarousel />
        <MeetYourHosts />
        <ContentHub />
        <FAQ />
        <BookingInvitation />
      </RootLayout>
    </>
  )
}
