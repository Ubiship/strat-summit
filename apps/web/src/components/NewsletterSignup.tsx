'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/Button'
import { subscribeToNewsletter } from '@/lib/actions'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData()
    formData.append('email', email)

    const result = await subscribeToNewsletter(formData)

    if (result.success) {
      setStatus('success')
      setMessage(result.message)
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.message)
    }
  }

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

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex flex-col gap-4 split:flex-row split:items-start">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading' || status === 'success'}
              className={clsx(
                'flex-auto rounded-2xl border-2 border-warm-ink/10 bg-white px-6 py-4 text-base font-medium text-warm-ink transition placeholder:text-warm-ink/40 focus:border-sun focus:outline-none disabled:opacity-50',
                'split:min-w-0'
              )}
            />
            <Button
              type="submit"
              tone="forest"
              size="md"
              disabled={status === 'loading' || status === 'success'}
              className="split:flex-none"
            >
              {status === 'loading'
                ? 'Subscribing...'
                : status === 'success'
                  ? 'Subscribed!'
                  : 'Subscribe'}
            </Button>
          </div>

          {message && (
            <p
              className={clsx(
                'mt-4 text-sm font-semibold',
                status === 'success' ? 'text-forest-warm' : 'text-red-700'
              )}
            >
              {message}
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
