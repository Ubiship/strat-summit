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
  try {
    return sessionStorage.getItem(SPLASH_KEY) !== null
  } catch {
    return true
  }
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
        try {
          sessionStorage.setItem(SPLASH_KEY, '1')
        } catch {}
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-6 text-ink"
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
            <LogoMark className="h-16" />
            <p className="mt-6 type-display text-4xl">{site.shortName}</p>
            <p className="mt-4 text-sm text-muted">
              {site.tagline}
            </p>
            <span
              aria-hidden="true"
              className="mt-6 h-1 w-10 rounded-full bg-highlight"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
