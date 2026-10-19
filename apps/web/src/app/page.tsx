import { type Metadata } from 'next'

import { HomePage } from '@/components/HomePage'

export const metadata: Metadata = {
  description:
    'Book vacation rentals on Mount Washington directly with us. Best rates guaranteed, local hosts, and exceptional mountain experiences.',
}

export default function Home() {
  return <HomePage option="a" />
}
