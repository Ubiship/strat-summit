'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Kicker } from '@/components/Kicker'
import { Logo } from '@/components/Logo'
import { NumberBadge } from '@/components/NumberBadge'
import { Offices } from '@/components/Offices'
import { SocialMedia } from '@/components/SocialMedia'

const headerLinks = [
  { href: '/property-management', label: 'Property Management' },
  { href: '/renovations', label: 'Renovations' },
  { href: '/about', label: 'About Us' },
]

const menuLinks = [...headerLinks, { href: '/contact', label: 'Contact' }]

function SiteHeader({
  panelId,
  menuOpen,
  onOpenMenu,
  openRef,
}: {
  panelId: string
  menuOpen: boolean
  onOpenMenu: () => void
  openRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-4 pt-5">
      <div className="mx-auto flex max-w-[75rem] items-center justify-between gap-4 rounded-full bg-warm-cream/95 py-2.5 pr-2.5 pl-3 text-warm-ink shadow-[0_18px_40px_rgb(42_24_10/0.18)] backdrop-blur">
        <Link href="/" className="rounded-full">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-full px-4 py-3 text-[0.9375rem] font-semibold transition hover:bg-sand split:inline-flex"
            >
              {link.label}
            </Link>
          ))}
          <span className="hidden split:block">
            <Button href="/contact" size="sm">
              Get in touch
            </Button>
          </span>
          <button
            ref={openRef}
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            className="rounded-full px-5 py-3 text-[0.9375rem] font-bold ring-2 ring-warm-ink ring-inset transition hover:bg-sand split:hidden"
          >
            Menu
          </button>
        </nav>
      </div>
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
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-forest-warm text-warm-cream"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <Container className="flex flex-auto flex-col">
        <div className="flex items-center justify-between pt-7">
          <Link href="/" onClick={onClose} className="rounded-full">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-sun px-6 py-4 font-bold text-warm-ink focus-visible:-outline-offset-4"
          >
            Close
          </button>
        </div>

        <nav aria-label="Main" className="mt-10">
          <ol role="list" className="grid gap-3">
            {menuLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-full bg-warm-cream/8 py-2.5 pr-6 pl-2.5 transition hover:bg-warm-cream/15"
                >
                  <NumberBadge value={index + 1} tone="sun" />
                  <span className="type-display text-[clamp(2rem,5vw,3.5rem)]">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-auto grid gap-10 py-12 split:grid-cols-2">
          <div>
            <Kicker as="h2" tone="dark">
              Service area
            </Kicker>
            <Offices invert className="mt-4" />
          </div>
          <div>
            <Kicker as="h2" tone="dark">
              Follow us
            </Kicker>
            <SocialMedia invert className="mt-5" />
          </div>
        </div>
      </Container>
    </motion.div>
  )
}

function RootLayoutInner({ children }: { children: React.ReactNode }) {
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
        <SiteHeader
          panelId={panelId}
          menuOpen={open}
          onOpenMenu={() => setOpen(true)}
          openRef={openRef}
        />
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

export function RootLayout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()

  return <RootLayoutInner key={pathname}>{children}</RootLayoutInner>
}
