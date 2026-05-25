import { type Metadata } from 'next'
import { Inter } from 'next/font/google'

import { site } from '@/lib/site'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s - ${site.shortName}`,
    default: `${site.shortName} - Property Management & Renovations`,
  },
  description: site.description,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full bg-neutral-950 text-base antialiased`}
    >
      <body className={`${inter.className} flex min-h-full flex-col`}>
        {children}
      </body>
    </html>
  )
}
