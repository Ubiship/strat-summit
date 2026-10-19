'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  stagger,
  useAnimate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

import { Button } from '@/components/Button'
import { Kicker } from '@/components/Kicker'
import { cn } from '@/lib/utils'

// Adapted from Aceternity's "simple CTA with images" block. The stacked
// avatars are property photos; hovering one names the property.
export type CtaImage = {
  name: string
  label?: string
  src: string
}

// Fixed tilts (the original used Math.random, which differs between the
// server render and hydration).
const TILTS = [-4, 6, -2, 8, -6, 3]

function FeaturedImages({
  images,
  caption,
  rating,
}: {
  images: CtaImage[]
  caption: string
  rating?: number
}) {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  let [scope, animate] = useAnimate()

  let x = useMotionValue(0)
  let translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), {
    stiffness: 100,
    damping: 5,
  })

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    let halfWidth = event.currentTarget.offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth)
  }

  useEffect(() => {
    animate(
      '.animation-container',
      { scale: [1.1, 1, 0.9, 1], opacity: [0, 1] },
      { duration: 0.4, delay: stagger(0.1) },
    )
  }, [animate])

  return (
    <div ref={scope} className="mt-10 flex flex-col items-center split:items-start">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex flex-row items-center pr-4">
          {images.map((image, idx) => (
            <div
              key={image.name}
              className="group relative -mr-4"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.6 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: 'spring', stiffness: 160, damping: 20 },
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.6 }}
                    style={{ translateX, whiteSpace: 'nowrap' }}
                    className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-ink px-4 py-2 text-xs shadow-xl"
                  >
                    <div className="absolute inset-x-0 -bottom-px mx-auto h-px w-[20%] bg-linear-to-r from-transparent via-highlight to-transparent" />
                    <div className="absolute inset-x-0 -bottom-px mx-auto h-px w-[70%] bg-linear-to-r from-transparent via-accent to-transparent" />
                    <span className="text-sm font-semibold text-white">
                      {image.name}
                    </span>
                    {image.label && (
                      <span className="rounded-sm bg-white/10 px-1.5 py-0.5 text-xs text-white/75">
                        {image.label}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="animation-container opacity-0">
                <motion.div
                  animate={{ rotate: `${TILTS[idx % TILTS.length]}deg` }}
                  whileHover={{ scale: 1.08, zIndex: 30 }}
                  transition={{ duration: 0.2 }}
                  className="relative size-16 overflow-hidden rounded-2xl border-2 border-white bg-mist shadow-[0_6px_16px_rgb(20_28_34/0.12)]"
                >
                  <Image
                    onMouseMove={handleMouseMove}
                    src={image.src}
                    alt={image.name}
                    fill
                    sizes="4rem"
                    className="object-cover"
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {rating && (
          <div
            className="flex items-center gap-1"
            aria-label={`${rating.toFixed(1)} out of 5 average guest rating`}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                aria-hidden="true"
                className="size-4 fill-highlight text-highlight"
              />
            ))}
            <span className="ml-1.5 text-sm font-medium text-ink">
              {rating.toFixed(1)}{' '}
              <span className="font-normal text-muted">guest rating</span>
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">{caption}</p>
    </div>
  )
}

export function SimpleCtaWithImages({
  kicker,
  title,
  description,
  primaryAction,
  secondaryAction,
  images,
  caption,
  rating,
}: {
  kicker: string
  title: string
  description: string
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
  images: CtaImage[]
  caption: string
  rating?: number
}) {
  return (
    <section className="bg-white px-4 pb-24 split:pb-36">
      <div
        className={cn(
          'mx-auto flex w-full max-w-[75rem] flex-col items-center justify-between gap-12 rounded-[2rem] border border-line bg-mist px-6 py-16 text-center',
          'split:flex-row split:px-16 split:py-20 split:text-left',
        )}
      >
        <div className="flex flex-col items-center split:items-start">
          <Kicker>{kicker}</Kicker>
          <h2 className="mt-4 max-w-xl type-display text-[clamp(2.25rem,4.5vw,3.5rem)] text-balance text-ink">
            {title}
          </h2>
          <p className="mt-6 max-w-md text-[1.0625rem]/[1.6] text-muted">
            {description}
          </p>
          <FeaturedImages images={images} caption={caption} rating={rating} />
        </div>

        <div className="flex flex-none flex-col items-center gap-4 split:items-end">
          <Button href={primaryAction.href} arrow>
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-accent transition hover:text-accent-deep"
            >
              {secondaryAction.label}
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
