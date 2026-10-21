import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-auto items-center overflow-hidden text-warm-cream">
      <div aria-hidden="true" className="absolute inset-0 -z-20 hero-fill" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hero-shade" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hero-glow" />
      <Container>
        <FadeIn className="flex max-w-xl flex-col items-start">
          <p className="type-display text-[clamp(6rem,14vw,11rem)]">404</p>
          <h1 className="mt-2 type-display text-5xl">Page not found</h1>
          <p className="mt-4 text-lg text-[#fbeedd]">
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
