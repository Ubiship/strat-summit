import { type Metadata } from 'next'
import { Fraunces, Outfit } from 'next/font/google'

import { site } from '@/lib/site'
import '@/styles/tailwind.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
})

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s - ${site.shortName}`,
    default: `${site.shortName} - Property Management & Renovations`,
  },
  description: site.description,
  icons: {
    icon: site.logos.icon,
    apple: site.logos.icon,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.shortName,
    images: [{ url: site.logos.full, alt: site.name }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} h-full bg-forest-deep text-base antialiased`}
    >
      <body className="flex min-h-full flex-col bg-forest-deep font-sans text-warm-ink">
        {children}
      </body>
    </html>
  )
}
