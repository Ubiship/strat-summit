'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'
import { HeroButton } from '@/components/ui/hero-with-background'

const headerLinks = [
  { href: '/stays', label: 'Stays' },
  { href: '/mount-washington', label: 'Mt Washington Info' },
  { href: '/property-management', label: 'Property Management' },
  { href: '/cleaning', label: 'Cleaning' },
  { href: '/renovations', label: 'Renovations' },
  { href: '/about', label: 'About Us' },
]

const menuLinks = [...headerLinks, { href: '/contact', label: 'Contact' }]

export type HeaderVariant = 'bar' | 'framed'

type SiteHeaderProps = {
  panelId: string
  menuOpen: boolean
  onOpenMenu: () => void
  openRef: React.RefObject<HTMLButtonElement | null>
}

function MenuButton({ panelId, menuOpen, onOpenMenu, openRef, className }: SiteHeaderProps & { className?: string }) {
  return (
    <button
      ref={openRef}
      type="button"
      onClick={onOpenMenu}
      aria-expanded={menuOpen}
      aria-controls={panelId}
      className={clsx(
        'rounded-full px-4 py-2 text-[0.9375rem] font-medium ring-1 ring-line ring-inset transition hover:ring-ink/30',
        className,
      )}
    >
      Menu
    </button>
  )
}

// Sits inside the homepage hero's frame lines (see HeroWithBackground), so it
// is positioned to the same insets rather than as a bar above the page.
function FramedHeader(props: SiteHeaderProps) {
  let pathname = usePathname()

  return (
    <header className="absolute inset-x-4 top-4 z-40 flex items-center justify-between gap-6 px-4 py-4 md:inset-x-10 md:top-10 md:px-10">
      <Link href="/" className="rounded-md">
        <Logo />
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-6">
        {headerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            className="hidden text-sm font-medium text-muted mix-blend-multiply transition-colors hover:text-ink xl:block"
          >
            {link.label}
          </Link>
        ))}
        <HeroButton href="/contact" className="hidden xl:flex">
          Get in touch
        </HeroButton>
        <MenuButton {...props} className="bg-white/70 backdrop-blur xl:hidden" />
      </nav>
    </header>
  )
}

function SiteHeader(props: SiteHeaderProps) {
  let pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-6">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              className="hidden rounded-full px-3 py-2 text-[0.875rem] text-muted transition hover:text-ink aria-[current=page]:text-ink split:inline-flex"
            >
              {link.label}
            </Link>
          ))}
          <span className="ml-3 hidden split:block">
            <Button href="/contact" size="sm">
              Get in touch
            </Button>
          </span>
          <MenuButton {...props} className="split:hidden" />
        </nav>
      </Container>
    </header>
  )
}

function MenuPanel({
  id,
  onClose,
  closeRef,
}: {
  id: string
  onClose: () => void
  closeRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white text-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Container className="flex flex-auto flex-col">
        <div className="flex h-18 items-center justify-between">
          <Link href="/" onClick={onClose} className="rounded-md">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[0.9375rem] font-medium ring-1 ring-line ring-inset transition hover:ring-ink/30"
          >
            Close
          </button>
        </div>

        <nav aria-label="Main" className="mt-6">
          <ul role="list" className="divide-y divide-line border-y border-line">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-5 text-[1.625rem] font-semibold tracking-[-0.02em] transition hover:text-accent"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-xl text-accent">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto py-10">
          <Button href="/contact" onClick={onClose} className="w-full justify-center">
            Get in touch
          </Button>
          <p className="mt-6 text-center text-sm text-muted">
            Mount Washington · Comox Valley
          </p>
        </div>
      </Container>
    </motion.div>
  )
}

function RootLayoutInner({
  header,
  children,
}: {
  header: HeaderVariant
  children: React.ReactNode
}) {
  let panelId = useId()
  let [open, setOpen] = useState(false)
  let openRef = useRef<HTMLButtonElement>(null)
  let closeRef = useRef<HTMLButtonElement>(null)
  let wasOpen = useRef(false)

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) openRef.current?.focus({ preventScroll: true })
      wasOpen.current = false
      return
    }

    wasOpen.current = true
    closeRef.current?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <div
        inert={open ? true : undefined}
        className="relative flex min-h-full flex-auto flex-col"
      >
        {(() => {
          let Header = header === 'framed' ? FramedHeader : SiteHeader
          return (
            <Header
              panelId={panelId}
              menuOpen={open}
              onOpenMenu={() => setOpen(true)}
              openRef={openRef}
            />
          )
        })()}
        <main className="w-full flex-auto">{children}</main>
        <Footer />
      </div>
      <AnimatePresence>
        {open && (
          <MenuPanel
            id={panelId}
            onClose={() => setOpen(false)}
            closeRef={closeRef}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function RootLayout({
  header = 'bar',
  children,
}: {
  header?: HeaderVariant
  children: React.ReactNode
}) {
  let pathname = usePathname()

  return (
    <RootLayoutInner key={pathname} header={header}>
      {children}
    </RootLayoutInner>
  )
}
