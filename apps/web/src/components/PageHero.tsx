import { HeroWithBackground } from '@/components/ui/hero-with-background'

// Inner-page header: the homepage's framed hero at a shorter height, so every
// page opens the same way.
export function PageHero({
  kicker,
  title,
  image,
  size = 'page',
  actions,
  children,
}: {
  kicker?: string
  title: string
  image?: { src: string; alt: string; position?: string }
  size?: 'full' | 'page' | 'short'
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <HeroWithBackground
      kicker={kicker}
      title={title}
      intro={children}
      image={image}
      size={size}
      actions={actions}
    />
  )
}
