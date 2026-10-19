import { type Metadata } from 'next'

import { HomePage } from '@/components/HomePage'

// Alternate homepage direction for client review; not linked or indexed.
export const metadata: Metadata = {
  title: 'Homepage option B',
  robots: { index: false, follow: false },
}

export default function HomeOptionB() {
  return <HomePage option="b" />
}
