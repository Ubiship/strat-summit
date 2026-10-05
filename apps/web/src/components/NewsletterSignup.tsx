'use client'

import { useActionState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import { subscribeToNewsletter, type NewsletterState } from '@/lib/actions'

const initialState: NewsletterState = {
  success: false,
  message: '',
}

export function NewsletterSignup() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState,
  )

  return (
    <div className="rounded-[2.75rem] bg-apricot p-8 text-warm-ink shadow-[0_12px_32px_rgb(42_24_10/0.08)] split:p-12">
      <div className="mx-auto max-w-[52rem] text-center">
        <h2 className="type-display text-[clamp(2.5rem,5vw,3.5rem)]">
          Get Mount Washington updates & exclusive offers
        </h2>
        <p className="mt-4 text-[1.1875rem]/[1.5] text-warm-ink/80">
          Join our newsletter for insider tips, seasonal deals, and the latest
          news from Mount Washington.
        </p>

        <form action={formAction} className="mt-8">
          <div className="flex flex-col gap-4 split:flex-row split:items-start">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              disabled={pending || state.success}
              className={clsx(
                'flex-auto rounded-2xl border-2 border-warm-ink/10 bg-white px-6 py-4 text-base font-medium text-warm-ink transition placeholder:text-warm-ink/40 focus:border-sun focus:outline-none disabled:opacity-50',
                'split:min-w-0'
              )}
            />
            <Button
              type="submit"
              tone="forest"
              size="md"
              disabled={pending || state.success}
              className="split:flex-none"
            >
              {pending
                ? 'Subscribing...'
                : state.success
                  ? 'Subscribed!'
                  : 'Subscribe'}
            </Button>
          </div>

          {state.message && (
            <p
              className={clsx(
                'mt-4 text-sm font-semibold',
                state.success ? 'text-forest-warm' : 'text-red-700'
              )}
            >
              {state.message}
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-warm-ink/60">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
