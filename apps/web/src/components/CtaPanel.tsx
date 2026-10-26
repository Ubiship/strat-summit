import { Band } from '@/components/Band'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { SansAmpersand } from '@/components/SansAmpersand'

// The closing invitation on a page: a contained pale green panel, so the
// page ends on one clear moment without a large solid colour area.
export function CtaPanel({
  title,
  actions,
  children,
}: {
  title: string
  actions: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Band rule={false} className="pt-0 split:pt-0">
      <Container>
        <FadeIn className="rounded-[2.5rem] bg-sand px-7 py-16 text-center split:rounded-[3.5rem] split:px-16 split:py-24">
          <h2 className="mx-auto max-w-[18ch] type-display text-[clamp(2.5rem,4.5vw,3.75rem)] text-balance text-forest-warm">
            <SansAmpersand>{title}</SansAmpersand>
          </h2>
          {children && (
            <div className="mx-auto mt-7 max-w-[48ch] space-y-5 text-[1.1875rem]/[1.6] text-pretty text-warm-muted">
              {children}
            </div>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {actions}
          </div>
        </FadeIn>
      </Container>
    </Band>
  )
}
