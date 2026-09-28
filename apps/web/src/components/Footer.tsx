import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { socialMediaProfiles } from '@/components/SocialMedia'
import { site } from '@/lib/site'

const navigation = [
  {
    title: 'Services',
    links: [
      { title: 'Property Management', href: '/property-management' },
      { title: 'Renovations', href: '/renovations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About', href: '/about' },
      { title: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Connect',
    links: socialMediaProfiles,
  },
]

export function Footer() {
  return (
    <Band tone="cream" as="footer" last>
      <Container>
        <div className="grid gap-10 split:grid-cols-[1.3fr_repeat(3,1fr)]">
          <Link href="/" aria-label="Home" className="self-start rounded-full">
            <Logo />
          </Link>
          {navigation.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-bold tracking-[0.08em] text-ember-deep uppercase">
                {section.title}
              </h2>
              <ul role="list" className="mt-3.5 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-[1.0625rem] font-semibold transition hover:text-ember-deep"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2 rounded-[2rem] bg-sand px-6 py-4.5 text-sm text-warm-muted split:rounded-full">
          <p>
            © {site.shortName} {new Date().getFullYear()}
          </p>
          <p>Mount Washington · Comox Valley</p>
        </div>
      </Container>
    </Band>
  )
}
