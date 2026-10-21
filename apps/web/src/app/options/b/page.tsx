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
  title: 'Homepage option B',
}

// White with a faint sage tint and two contained green cards. Amber only on the
// closing call to action, stars and kicker dots.
export default function HomeOptionB() {
  return (
    <div data-palette="b">
      <RootLayout ctaTone="forest">
        <HeroWithSearch searchTone="forest" />
        <PropertyShowcase />
        <WhyBookDirect />
        <ReviewCarousel variant="card" />
        <MeetYourHosts />
        <ContentHub />
        <FAQ />
        <BookingInvitation variant="card" />
      </RootLayout>
      <OptionSwitcher current="/options/b" />
    </div>
  )
}
