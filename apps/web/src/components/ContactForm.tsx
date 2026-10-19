'use client'

import { useActionState, useId } from 'react'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import { submitContactForm, type ContactFormState } from '@/lib/actions'

const initialState: ContactFormState = {
  success: false,
  message: '',
}

const serviceOptions = [
  { value: '', label: 'Select an option' },
  { value: 'booking', label: 'Booking a vacation rental' },
  { value: 'pm', label: 'Property management' },
  { value: 'cleaning', label: 'Cleaning services' },
  { value: 'reno', label: 'Renovations' },
  { value: 'other', label: 'Something else' },
]

function TextInput({
  label,
  required,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & {
  label: string
  required?: boolean
}) {
  let id = useId()

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        required={required}
        {...props}
        placeholder=" "
        className="peer block w-full rounded-2xl border border-line bg-white px-5 pt-7 pb-2.5 text-base/6 text-ink transition hover:border-ink/25 focus:border-accent focus:ring-3 focus:ring-accent/15 focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-5 -mt-3 origin-left text-base/6 text-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-medium peer-not-placeholder-shown:text-muted peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-accent"
      >
        {label}
        {required ? (
          <span className="text-accent" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
    </div>
  )
}

function TextArea({
  label,
  required,
  ...props
}: React.ComponentPropsWithoutRef<'textarea'> & {
  label: string
  required?: boolean
}) {
  let id = useId()

  return (
    <div className="relative">
      <textarea
        id={id}
        required={required}
        rows={5}
        {...props}
        placeholder=" "
        className="peer block w-full resize-y rounded-2xl border border-line bg-white px-5 pt-8 pb-3 text-base/6 text-ink transition hover:border-ink/25 focus:border-accent focus:ring-3 focus:ring-accent/15 focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-4 left-5 origin-left text-base/6 text-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-1.5 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-medium peer-focus:-translate-y-1.5 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-accent"
      >
        {label}
        {required ? (
          <span className="text-accent" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
    </div>
  )
}

function SelectInput({
  label,
  options,
  ...props
}: React.ComponentPropsWithoutRef<'select'> & {
  label: string
  options: { value: string; label: string }[]
}) {
  let id = useId()

  return (
    <div className="rounded-2xl border border-line bg-white px-5 pt-3 pb-2 transition focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15 hover:border-ink/25">
      <label htmlFor={id} className="block text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="mt-0.5 block w-full bg-transparent py-1 text-base/6 text-ink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  )

  return (
    <FadeIn className="rounded-[1.5rem] border border-line bg-white p-8 split:p-10">
      <form action={formAction}>
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.025em] text-ink">
          Send us a message
        </h2>
        <p className="mt-2 text-base text-muted">
          We typically respond within one business day.
        </p>

        {state.message ? (
          <p
            role="status"
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              state.success ? 'bg-tint text-accent-deep' : 'bg-red-50 text-red-800'
            }`}
          >
            {state.success
              ? "Thanks for getting in touch. We'll be in contact soon."
              : state.message}
          </p>
        ) : null}

        <div
          className={`mt-7 grid gap-3 ${
            pending || state.success ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <TextInput label="Name" name="name" autoComplete="name" required />
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
          <TextInput
            label="Phone (optional)"
            type="tel"
            name="phone"
            autoComplete="tel"
          />
          <TextArea label="Message" name="message" required />
          <SelectInput
            label="What can we help with?"
            name="service"
            options={serviceOptions}
          />
        </div>

        <Button
          type="submit"
          arrow
          className="mt-8"
          disabled={pending || state.success}
        >
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </FadeIn>
  )
}
