'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { Button, type ButtonTone } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Kicker } from '@/components/Kicker'
import { Logo } from '@/components/Logo'
import { Offices } from '@/components/Offices'

type NavItem = {
  href: string
  label: string
  children?: { href: string; label: string }[]
}

const headerLinks: NavItem[] = [
  {
    href: '/stays',
    label: 'Vacation Rentals',
    children: [{ href: '/mount-washington', label: 'Mt Washington Info' }],
  },
  { href: '/property-management', label: 'Property Management' },
  {
    href: '#',
    label: 'Property Support Services',
    children: [
      { href: '/cleaning', label: 'Cleaning' },
      { href: '/renovations', label: 'Renovations' },
    ],
  },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

// Flatten for mobile menu
const menuLinks = [
  { href: '/stays', label: 'Vacation Rentals' },
  { href: '/mount-washington', label: 'Mt Washington Info' },
  { href: '/property-management', label: 'Property Management' },
  { href: '/cleaning', label: 'Cleaning' },
  { href: '/renovations', label: 'Renovations' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

function NavDropdown({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="hidden rounded-full px-4 py-3 text-[0.9375rem] font-semibold transition hover:bg-sand split:inline-flex"
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div
      className="relative hidden split:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-[0.9375rem] font-semibold transition hover:bg-sand"
      >
        {item.label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Link>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-2xl bg-warm-cream p-2 shadow-lg"
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block rounded-xl px-4 py-2.5 text-[0.9375rem] font-medium transition hover:bg-sand"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SiteHeader({
  panelId,
  menuOpen,
  onOpenMenu,
  openRef,
  ctaTone,
}: {
  panelId: string
  menuOpen: boolean
  onOpenMenu: () => void
  openRef: React.RefObject<HTMLButtonElement | null>
  ctaTone: ButtonTone
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-warm-ink/10 bg-warm-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-warm-ink sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {headerLinks.map((link) => (
            <NavDropdown key={link.label} item={link} />
          ))}
          <span className="hidden split:block">
            <Button href="/stays" size="sm" tone={ctaTone}>
              Book Now
            </Button>
          </span>
          <button
            ref={openRef}
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            className="rounded-full px-5 py-3 text-[0.9375rem] font-bold ring-2 ring-warm-ink transition ring-inset hover:bg-sand split:hidden"
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
  let pathname = usePathname()

  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white text-warm-ink"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
    >
      <div className="border-b border-warm-ink/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" onClick={onClose} className="rounded-full">
            <Logo />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-3 text-[0.9375rem] font-bold text-forest-warm ring-2 ring-forest-warm transition ring-inset hover:bg-forest-warm/5"
          >
            Close
          </button>
        </div>
      </div>

      <Container className="flex flex-auto flex-col">
        <nav aria-label="Main" className="mt-6">
          <ul role="list" className="divide-y divide-warm-ink/10">
            {menuLinks.map((link) => {
              let current = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-center justify-between gap-4 py-4.5 text-forest-warm"
                  >
                    <span className="flex items-center gap-3 text-[1.375rem] font-semibold tracking-[-0.01em]">
                      {link.label}
                      {current && (
                        <span
                          aria-hidden="true"
                          className="size-2 flex-none rounded-full bg-sun"
                        />
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-lg text-forest-warm/40 transition group-hover:translate-x-1 group-hover:text-forest-warm"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-8 mb-10">
          <Button href="/stays" tone="forest" onClick={onClose} arrow>
            Book Now
          </Button>
        </div>

        <div className="mt-auto border-t border-warm-ink/10 py-10">
          <Kicker as="h2">Service area</Kicker>
          <Offices className="mt-4" />
        </div>
      </Container>
    </motion.div>
  )
}

function RootLayoutInner({
  children,
  ctaTone,
}: {
  children: React.ReactNode
  ctaTone: ButtonTone
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
        className="relative flex min-h-full flex-auto flex-col pt-[72px]"
      >
        <SiteHeader
          panelId={panelId}
          menuOpen={open}
          onOpenMenu={() => setOpen(true)}
          openRef={openRef}
          ctaTone={ctaTone}
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

export function RootLayout({
  children,
  ctaTone = 'sun',
}: {
  children: React.ReactNode
  ctaTone?: ButtonTone
}) {
  let pathname = usePathname()

  return (
    <RootLayoutInner key={pathname} ctaTone={ctaTone}>
      {children}
    </RootLayoutInner>
  )
}
