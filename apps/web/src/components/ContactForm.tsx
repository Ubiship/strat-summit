'use client'

import { useActionState, useId } from 'react'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import { submitContactForm, type ContactFormState } from '@/lib/actions'

const initialState: ContactFormState = {
  success: false,
  message: '',
}

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

function RadioInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="mt-0.5 size-5 flex-none appearance-none rounded-full border border-ink/25 bg-white transition checked:border-[0.35rem] checked:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <span className="text-base/6 text-ink">{label}</span>
    </label>
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
            {state.message}
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
          <TextInput label="Phone" type="tel" name="phone" autoComplete="tel" />
          <TextInput label="Property location" name="location" />
          <TextArea label="Message" name="message" required />
          <div className="rounded-2xl border border-line bg-white px-5 py-6">
            <fieldset>
              <legend className="text-base/6 font-medium text-ink">
                What can we help with?
              </legend>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <RadioInput
                  label="Property management / cleaning"
                  name="service"
                  value="pm"
                  defaultChecked
                />
                <RadioInput
                  label="Renovation / construction"
                  name="service"
                  value="reno"
                />
                <RadioInput label="Both" name="service" value="both" />
                <RadioInput label="Not sure yet" name="service" value="other" />
              </div>
            </fieldset>
          </div>
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
