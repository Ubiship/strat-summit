import Link from 'next/link'
import clsx from 'clsx'

const options = [
  { href: '/options/a', label: 'Option A' },
  { href: '/options/b', label: 'Option B' },
  { href: '/', label: 'Current' },
]

// Floating pill so the client can flip between homepage options.
export function OptionSwitcher({ current }: { current: string }) {
  return (
    <nav
      aria-label="Homepage options"
      className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-4"
    >
      <ul
        role="list"
        className="flex gap-1 rounded-full bg-white p-1.5 text-sm font-bold shadow-[0_8px_30px_rgb(42_24_10/0.15)] ring-1 ring-warm-ink/10"
      >
        {options.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              aria-current={option.href === current ? 'page' : undefined}
              className={clsx(
                'block rounded-full px-4 py-2.5 transition',
                option.href === current
                  ? 'bg-forest-warm text-white'
                  : 'text-forest-warm hover:bg-forest-warm/8',
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
