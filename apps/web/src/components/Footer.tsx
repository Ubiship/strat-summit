import { socialMediaProfiles } from '@/components/SocialMedia'
import { CenteredFooterWithLogo } from '@/components/ui/centered-footer-with-logo'
import { site } from '@/lib/site'

const pages = [
  { title: 'Stays', href: '/stays' },
  { title: 'Mt Washington Info', href: '/mount-washington' },
  { title: 'Property Management', href: '/property-management' },
  { title: 'Cleaning', href: '/cleaning' },
  { title: 'Renovations', href: '/renovations' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
]

export function Footer() {
  return (
    <CenteredFooterWithLogo
      pages={pages}
      socials={socialMediaProfiles}
      copyright={
        <>
          &copy; {site.shortName} {new Date().getFullYear()}{' '}
          <span className="whitespace-nowrap">
            · Mount Washington · Comox Valley
          </span>
        </>
      }
    />
  )
}
