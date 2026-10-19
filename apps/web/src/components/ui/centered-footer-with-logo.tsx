import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

// Adapted from Aceternity's "centered with logo" footer block.
type FooterLink = { title: string; href: string }
type SocialLink = FooterLink & {
  icon: React.ComponentType<React.ComponentPropsWithoutRef<'svg'>>
}

function GridLineHorizontal({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          '--background': '#ffffff',
          '--color': 'rgb(20 28 34 / 0.18)',
          '--height': '1px',
          '--width': '5px',
          '--fade-stop': '90%',
          '--offset': offset || '200px',
          maskComposite: 'exclude',
        } as React.CSSProperties
      }
      className={cn(
        'h-(--height) w-[calc(100%+var(--offset))]',
        'bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        className,
      )}
    />
  )
}

export function CenteredFooterWithLogo({
  pages,
  socials,
  copyright,
}: {
  pages: FooterLink[]
  socials: SocialLink[]
  copyright: React.ReactNode
}) {
  return (
    <footer className="relative w-full overflow-hidden border-t border-line bg-white px-6 py-20 split:px-8">
      <div className="mx-auto max-w-[75rem] text-sm text-muted">
        <div className="relative flex w-full flex-col items-center">
          <Link href="/" className="mb-8 rounded-md text-ink">
            <Logo />
          </Link>

          <nav aria-label="Footer">
            <ul
              role="list"
              className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-7"
            >
              {pages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <GridLineHorizontal className="mx-auto mt-10 max-w-[75rem]" />
        </div>

        <div className="mt-8 flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-center sm:text-left">{copyright}</p>
          <ul role="list" className="flex gap-4">
            {socials.map(({ title, href, icon: Icon }) => (
              <li key={title}>
                <Link
                  href={href}
                  aria-label={title}
                  className="text-muted transition-colors hover:text-accent"
                >
                  <Icon className="size-6 fill-current" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
