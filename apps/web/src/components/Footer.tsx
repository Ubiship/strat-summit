import Link from 'next/link'

import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { site } from '@/lib/site'

const navigation = [
  {
    title: 'Services',
    links: [
      { title: 'Find Your Stay', href: '/stays' },
      { title: 'Property Management', href: '/property-management' },
      { title: 'Cleaning', href: '/cleaning' },
      { title: 'Renovations', href: '/renovations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'Mt Washington Info', href: '/mount-washington' },
      { title: 'Contact', href: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <Band as="footer" last>
      <Container>
        <div className="grid gap-12 split:grid-cols-[1.5fr_repeat(2,1fr)] split:gap-16">
          <Link href="/" className="self-start rounded-full">
            <Logo />
          </Link>
          {navigation.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-bold tracking-[0.12em] text-forest-warm uppercase">
                {section.title}
              </h2>
              <ul role="list" className="mt-5 space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.href}
                      className="text-[1.0625rem] font-semibold transition hover:text-forest-warm"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap justify-between gap-x-8 gap-y-3 rounded-[2.5rem] bg-sand px-8 py-5 text-sm text-warm-muted split:rounded-full">
          <p>
            © {site.shortName} {new Date().getFullYear()}
          </p>
          <p>Mount Washington · Comox Valley</p>
        </div>
      </Container>
    </Band>
  )
}
