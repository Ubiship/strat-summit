'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { Button } from '@/components/Button'
import {
  PropertyHighlights,
  PropertyTypeLabel,
} from '@/components/PropertyHighlights'
import type { PropertyHighlights as Highlights } from '@/lib/propertyHighlights'

// Adapted from Aceternity's "expandable card on click" block: a card grows
// into a centred panel with the full details, sharing its photo and title
// through layout animation.
export type ExpandableProperty = {
  id: number
  name: string
  address: string
  description: string
  href: string
  rating?: number
  reviewCount?: number
  highlights: Highlights
  image?: { src: string; alt: string }
}

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
) {
  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      callback()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}

function Rating({
  rating,
  reviewCount,
}: Pick<ExpandableProperty, 'rating' | 'reviewCount'>) {
  if (!rating) return null

  return (
    <p className="flex flex-none items-center gap-1 text-[0.875rem] font-medium text-ink">
      <span aria-hidden="true" className="text-highlight">
        ★
      </span>
      {rating.toFixed(1)}
      {reviewCount && <span className="text-muted">({reviewCount})</span>}
    </p>
  )
}

function Photo({
  property,
  sizes,
  className,
}: {
  property: ExpandableProperty
  sizes: string
  className?: string
}) {
  return (
    <motion.div
      layoutId={`image-${property.id}`}
      className={`relative overflow-hidden rounded-[1.5rem] bg-mist ${className ?? ''}`}
    >
      {property.image && (
        <Image
          src={property.image.src}
          alt={property.image.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </motion.div>
  )
}

export function ExpandablePropertyCards({
  properties,
}: {
  properties: ExpandableProperty[]
}) {
  let [active, setActive] = useState<ExpandableProperty | null>(null)
  let panelRef = useRef<HTMLDivElement>(null)
  let closeRef = useRef<HTMLButtonElement>(null)
  let openerRef = useRef<HTMLButtonElement | null>(null)
  let titleId = useId()

  useOutsideClick(panelRef, () => setActive(null))

  useEffect(() => {
    if (!active) {
      openerRef.current?.focus({ preventScroll: true })
      return
    }

    closeRef.current?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active])

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-ink/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[100] grid place-items-center p-4">
            <motion.div
              ref={panelRef}
              layoutId={`card-${active.id}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative flex max-h-[90svh] w-full max-w-xl flex-col overflow-y-auto rounded-[1.75rem] bg-white shadow-[0_30px_80px_rgb(20_28_34/0.18)]"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-ink ring-1 ring-line backdrop-blur transition hover:bg-white"
              >
                <X aria-hidden="true" className="size-4.5" strokeWidth={2} />
                <span className="sr-only">Close</span>
              </button>

              <Photo
                property={active}
                sizes="(min-width: 36rem) 36rem, 100vw"
                className="aspect-[2/1] flex-none rounded-b-none"
              />

              <div className="flex flex-col items-start p-6 sm:p-8">
                <PropertyTypeLabel type={active.highlights.type} className="mb-3" />
                <div className="flex w-full items-start justify-between gap-4">
                  <motion.h3
                    id={titleId}
                    layoutId={`title-${active.id}`}
                    className="text-[1.625rem] font-semibold tracking-[-0.02em] text-ink"
                  >
                    {active.name}
                  </motion.h3>
                  <Rating rating={active.rating} reviewCount={active.reviewCount} />
                </div>
                <motion.p
                  layoutId={`address-${active.id}`}
                  className="mt-1 text-[0.9375rem] text-muted"
                >
                  {active.address}
                </motion.p>

                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <PropertyHighlights
                    highlights={active.highlights}
                    size="lg"
                    className="mt-6 border-y border-line py-5"
                  />
                  <p className="mt-6 line-clamp-6 text-base/[1.7] whitespace-pre-line text-ink/85">
                    {active.description}
                  </p>
                </motion.div>
              </div>

              {/* Pinned so the next step is visible without scrolling the panel. */}
              <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-3 border-t border-line bg-white/95 px-6 py-4 backdrop-blur sm:px-8">
                <Button href={active.href} arrow>
                  View property
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ul
        role="list"
        className="mt-14 grid gap-x-8 gap-y-14 split:mt-16 split:grid-cols-2"
      >
        {properties.map((property) => (
          <motion.li
            key={property.id}
            layoutId={`card-${property.id}`}
            className="group relative flex flex-col"
          >
            <Photo
              property={property}
              sizes="(min-width: 56.25rem) 36rem, 100vw"
              className="aspect-[4/3]"
            />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <PropertyTypeLabel type={property.highlights.type} className="mb-2" />
                <motion.h3
                  layoutId={`title-${property.id}`}
                  className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      openerRef.current = event.currentTarget
                      setActive(property)
                    }}
                    className="text-left after:absolute after:inset-0 after:cursor-pointer"
                  >
                    {property.name}
                  </button>
                </motion.h3>
                <motion.p
                  layoutId={`address-${property.id}`}
                  className="mt-0.5 text-[0.875rem] text-muted"
                >
                  {property.address}
                </motion.p>
              </div>
              <Rating rating={property.rating} reviewCount={property.reviewCount} />
            </div>
            <PropertyHighlights highlights={property.highlights} className="mt-3" />
          </motion.li>
        ))}
      </ul>
    </>
  )
}
