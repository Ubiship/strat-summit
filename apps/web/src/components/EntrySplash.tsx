'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { LogoMark } from '@/components/Logo'
import { site } from '@/lib/site'

const SPLASH_KEY = 'strathcona-splash-seen'

function subscribe() {
  return () => {}
}

function getSeenOnClient() {
  return sessionStorage.getItem(SPLASH_KEY) !== null
}

// The server never shows the splash, so hydration always starts hidden.
function getSeenOnServer() {
  return true
}

export function EntrySplash() {
  const shouldReduceMotion = useReducedMotion()
  const alreadySeen = useSyncExternalStore(
    subscribe,
    getSeenOnClient,
    getSeenOnServer,
  )
  const [dismissed, setDismissed] = useState(false)
  const show = !alreadySeen && !dismissed

  useEffect(() => {
    if (alreadySeen) {
      return
    }

    document.body.style.overflow = 'hidden'

    const timer = window.setTimeout(
      () => {
        sessionStorage.setItem(SPLASH_KEY, '1')
        setDismissed(true)
        document.body.style.overflow = ''
      },
      shouldReduceMotion ? 600 : 2800,
    )

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [alreadySeen, shouldReduceMotion])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="entry-splash"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-warm-cream px-6 text-warm-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.9,
            ease: 'easeOut',
          }}
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <LogoMark className="size-28" />
            <p className="mt-6 type-display text-5xl">{site.shortName}</p>
            <p className="mt-4 text-xs font-bold tracking-[0.16em] text-warm-muted uppercase">
              {site.tagline}
            </p>
            <span
              aria-hidden="true"
              className="mt-6 h-1.5 w-12 rounded-full bg-sun"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
