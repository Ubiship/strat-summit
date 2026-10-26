import clsx from 'clsx'

import { Container } from '@/components/Container'

// White sections divided by a container-width hairline. The rule is hidden
// directly after a hero, whose rounded white lip (hero-cap) already marks
// the edge.
export function Band({
  as: Component = 'section',
  last = false,
  rule = true,
  className,
  children,
}: {
  as?: 'section' | 'footer' | 'div'
  last?: boolean
  rule?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <Component
      className={clsx(
        'band relative bg-white text-warm-ink',
        last ? 'pt-16 pb-10 split:pt-24 split:pb-12' : 'py-18 split:py-32',
        className,
      )}
    >
      {rule && (
        <Container
          aria-hidden="true"
          className="band-rule pointer-events-none absolute inset-x-0 top-0"
        >
          <div className="border-t border-forest-warm/12" />
        </Container>
      )}
      {children}
    </Component>
  )
}
