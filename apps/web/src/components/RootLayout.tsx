'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'
import { HeroButton } from '@/components/ui/hero-with-background'

type NavItem = {
  href?: string
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
    label: 'Property Support Services',
    children: [
      { href: '/cleaning', label: 'Cleaning' },
      { href: '/renovations', label: 'Renovations' },
    ],
  },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

// Flattened for the mobile menu
const menuLinks = [
  { href: '/stays', label: 'Vacation Rentals' },
  { href: '/mount-washington', label: 'Mt Washington Info' },
  { href: '/property-management', label: 'Property Management' },
  { href: '/cleaning', label: 'Cleaning' },
  { href: '/renovations', label: 'Renovations' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

export type HeaderVariant = 'bar' | 'framed'

type SiteHeaderProps = {
  panelId: string
  menuOpen: boolean
  onOpenMenu: () => void
  openRef: React.RefObject<HTMLButtonElement | null>
}

const navLinkClasses =
  'inline-flex items-center gap-1 rounded-full px-3 py-2 text-[0.875rem] text-muted transition hover:text-ink aria-[current=page]:text-ink'

function isCurrent(pathname: string, href?: string) {
  return href ? pathname.startsWith(href) : false
}

// Opens on hover and on keyboard focus, and closes on Escape or when focus
// leaves, so the submenu is reachable without a mouse.
function NavDropdown({ item }: { item: NavItem }) {
  let pathname = usePathname()
  let [isOpen, setIsOpen] = useState(false)
  let timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  let menuId = useId()

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
        className={navLinkClasses}
      >
        {item.label}
      </Link>
    )
  }

  function open() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  function close() {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  let current =
    isCurrent(pathname, item.href) ||
    item.children.some((child) => isCurrent(pathname, child.href))
  let chevron = (
    <ChevronDown
      aria-hidden="true"
      strokeWidth={1.75}
      className={clsx('size-3.5 transition-transform', isOpen && 'rotate-180')}
    />
  )

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setIsOpen(false)
      }}
    >
      {item.href ? (
        <Link
          href={item.href}
          aria-current={current ? 'page' : undefined}
          aria-expanded={isOpen}
          aria-controls={menuId}
          className={navLinkClasses}
        >
          {item.label}
          {chevron}
        </Link>
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((value) => !value)}
          className={clsx(navLinkClasses, current && 'text-ink')}
        >
          {item.label}
          {chevron}
        </button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-50 mt-2 min-w-[13rem] rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_40px_rgb(20_28_34/0.1)]"
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                aria-current={
                  isCurrent(pathname, child.href) ? 'page' : undefined
                }
                className="block rounded-xl px-3.5 py-2.5 text-[0.9375rem] text-ink transition hover:bg-mist aria-[current=page]:text-accent"
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

function MenuButton({
  panelId,
  menuOpen,
  onOpenMenu,
  openRef,
  className,
}: SiteHeaderProps & { className?: string }) {
  return (
    <button
      ref={openRef}
      type="button"
      onClick={onOpenMenu}
      aria-expanded={menuOpen}
      aria-controls={panelId}
      className={clsx(
        'rounded-full px-4 py-2 text-[0.9375rem] font-medium ring-1 ring-line transition ring-inset hover:ring-ink/30',
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
  return (
    <header className="absolute inset-x-4 top-4 z-40 flex items-center justify-between gap-6 px-4 py-4 md:inset-x-10 md:top-10 md:px-10">
      <Link href="/" className="rounded-md">
        <Logo />
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-2">
        <div className="hidden items-center gap-1 xl:flex">
          {headerLinks.map((item) => (
            <NavDropdown key={item.label} item={item} />
          ))}
        </div>
        <HeroButton href="/stays" className="ml-3 hidden xl:flex">
          Book Now
        </HeroButton>
        <MenuButton
          {...props}
          className="bg-white/70 backdrop-blur xl:hidden"
        />
      </nav>
    </header>
  )
}

// The full navigation needs ~1280px; narrower screens use the menu panel.
function SiteHeader(props: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-xl">
      <Container className="flex h-18 items-center justify-between gap-6">
        <Link href="/" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <div className="hidden items-center gap-0.5 xl:flex">
            {headerLinks.map((item) => (
              <NavDropdown key={item.label} item={item} />
            ))}
          </div>
          <span className="ml-3 hidden xl:block">
            <Button href="/stays" size="sm">
              Book Now
            </Button>
          </span>
          <MenuButton {...props} className="xl:hidden" />
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
            className="rounded-full px-4 py-2 text-[0.9375rem] font-medium ring-1 ring-line transition ring-inset hover:ring-ink/30"
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
          <Button
            href="/stays"
            onClick={onClose}
            className="w-full justify-center"
          >
            Book Now
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
