import { type Metadata } from 'next'

import { BookingInvitation } from '@/components/BookingInvitation'
import { ContentHub } from '@/components/ContentHub'
import { FAQ } from '@/components/FAQ'
import { HeroWithSearch } from '@/components/HeroWithSearch'
import { MeetYourHosts } from '@/components/MeetYourHosts'
import { PropertyShowcase } from '@/components/PropertyShowcase'
import { ReviewCarousel } from '@/components/ReviewCarousel'
import { RootLayout } from '@/components/RootLayout'
import { WhyBookDirect } from '@/components/WhyBookDirect'

import { OptionSwitcher } from '../OptionSwitcher'

export const metadata: Metadata = {
  title: 'Homepage option A',
}

// All white with hairline dividers. Amber only on Search, stars and kicker dots.
export default function HomeOptionA() {
  return (
    <div data-palette="a">
      <RootLayout ctaTone="forest">
        <HeroWithSearch />
        <PropertyShowcase />
        <WhyBookDirect />
        <ReviewCarousel variant="light" />
        <MeetYourHosts />
        <ContentHub />
        <FAQ />
        <BookingInvitation variant="light" />
      </RootLayout>
      <OptionSwitcher current="/options/a" />
    </div>
  )
}
