import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-auto items-center bg-white text-warm-ink">
      <Container>
        <FadeIn className="flex max-w-xl flex-col items-start">
          <p className="type-display text-[clamp(6rem,14vw,11rem)] text-forest-warm">404</p>
          <h1 className="mt-2 type-display text-5xl">Page not found</h1>
          <p className="mt-4 text-lg text-warm-muted">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <Button href="/" arrow className="mt-8">
            Go to the home page
          </Button>
        </FadeIn>
      </Container>
    </main>
  )
}
