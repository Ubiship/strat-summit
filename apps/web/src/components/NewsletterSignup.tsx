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
    <div className="text-ink">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="type-display text-[clamp(2.25rem,4.5vw,3.25rem)] text-balance">
          Mount Washington updates and offers
        </h2>
        <p className="mt-4 text-[1.1875rem]/[1.5] text-muted">
          Join our newsletter for insider tips, seasonal deals, and the latest
          news from Mount Washington.
        </p>

        <form action={formAction} className="mx-auto mt-10 max-w-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              disabled={pending || state.success}
              className={clsx(
                'flex-auto rounded-full border border-line bg-white px-5 py-3.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none disabled:opacity-50',
                'sm:min-w-0'
              )}
            />
            <Button
              type="submit"
              tone="accent"
              size="md"
              disabled={pending || state.success}
              className="justify-center sm:flex-none"
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
                state.success ? 'text-accent' : 'text-red-700'
              )}
            >
              {state.message}
            </p>
          )}
        </form>

        <p className="mt-5 text-sm text-muted">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  )
}
