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
        className="peer block w-full rounded-full border-2 border-sand bg-white px-6 pt-7 pb-2.5 text-base/6 text-warm-ink transition focus:border-warm-ink focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-warm-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-warm-ink peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-warm-ink"
      >
        {label}
        {required ? (
          <span className="text-ember-deep" aria-hidden="true">
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
        className="size-6 flex-none appearance-none rounded-full border-2 border-warm-ink/25 bg-white checked:border-[0.45rem] checked:border-sun"
      />
      <span className="text-base/6 text-warm-ink">{label}</span>
    </label>
  )
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  )

  return (
    <FadeIn className="rounded-[2.5rem] bg-warm-cream p-7 shadow-[0_24px_60px_rgb(42_24_10/0.08)] split:p-10">
      <form action={formAction}>
        <h2 className="type-display text-4xl">Send us a message</h2>
        <p className="mt-3 text-base text-warm-muted">
          We typically respond within one business day.
        </p>

        {state.message ? (
          <p
            role="status"
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              state.success ? 'bg-sand text-warm-ink' : 'bg-red-50 text-red-800'
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
          <TextInput label="Message" name="message" required />
          <div className="rounded-[2rem] border-2 border-sand bg-white px-6 py-6">
            <fieldset>
              <legend className="text-base/6 font-semibold text-warm-ink">
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
