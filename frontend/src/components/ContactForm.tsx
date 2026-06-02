'use client'

import { useActionState, useId } from 'react'

import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import {
  submitContactForm,
  type ContactFormState,
} from '@/lib/actions'

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
    <div className="group relative z-0 transition-all focus-within:z-10">
      <input
        type="text"
        id={id}
        required={required}
        {...props}
        placeholder=" "
        className="peer block w-full border border-neutral-300 bg-transparent px-6 pt-12 pb-4 text-base/6 text-neutral-950 ring-4 ring-transparent transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-gold focus:ring-gold/20 focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-neutral-500 transition-all duration-200 peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-neutral-950 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-gold"
      >
        {label}
        {required ? (
          <span className="text-gold" aria-hidden="true">
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
        className="h-6 w-6 flex-none appearance-none rounded-full border border-neutral-950/20 outline-hidden checked:border-[0.5rem] checked:border-gold focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2"
      />
      <span className="text-base/6 text-neutral-950">{label}</span>
    </label>
  )
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState,
  )

  return (
    <FadeIn className="lg:order-last">
      <form action={formAction}>
        <h2 className="font-display text-base font-semibold text-neutral-950">
          Send us a message
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          We typically respond within one business day.
        </p>

        {state.message ? (
          <p
            role="status"
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              state.success
                ? 'bg-neutral-100 text-neutral-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <div
          className={`isolate mt-6 -space-y-px rounded-2xl bg-white/50 ${
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
          <div className="border border-neutral-300 px-6 py-8 first:rounded-t-2xl last:rounded-b-2xl">
            <fieldset>
              <legend className="text-base/6 text-neutral-500">
                What can we help with?
              </legend>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <Button type="submit" className="mt-10" disabled={pending || state.success}>
          {pending ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </FadeIn>
  )
}
