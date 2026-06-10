'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { site } from '@/lib/site'

const SPLASH_KEY = 'strathcona-splash-seen'

export function EntrySplash() {
  const shouldReduceMotion = useReducedMotion()
  const [show, setShow] = useState<boolean | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setShow(false)
      return
    }

    setShow(true)
    document.body.style.overflow = 'hidden'

    const timer = window.setTimeout(
      () => {
        setShow(false)
        sessionStorage.setItem(SPLASH_KEY, '1')
        document.body.style.overflow = ''
      },
      shouldReduceMotion ? 600 : 2800,
    )

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [shouldReduceMotion])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="entry-splash"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.9,
            ease: 'easeOut',
          }}
        >
          <motion.div
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(94vw,72rem)]"
          >
            <Image
              src={site.logos.full}
              alt={site.name}
              width={1200}
              height={675}
              priority
              className="h-auto w-full object-contain"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
