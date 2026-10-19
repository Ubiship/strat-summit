import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-auto items-center bg-white text-ink">
      <Container>
        <FadeIn className="mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="type-display text-[clamp(5rem,12vw,8rem)] text-accent">404</p>
          <h1 className="mt-2 type-display text-4xl">Page not found</h1>
          <p className="mt-4 text-lg text-muted">
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
