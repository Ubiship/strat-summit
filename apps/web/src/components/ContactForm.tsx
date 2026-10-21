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
        className="peer block w-full rounded-full border-2 border-warm-ink/50 bg-white px-6 pt-7 pb-2.5 text-base/6 text-warm-ink transition focus:border-warm-ink focus:ring-2 focus:ring-warm-ink focus:outline-hidden"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-base/6 text-warm-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-3 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-warm-ink peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-warm-ink"
      >
        {label}
        {required ? (
          <span className="text-forest-warm" aria-hidden="true">
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
        {...props}
        placeholder=" "
        rows={5}
        className="peer block w-full rounded-3xl border-2 border-warm-ink/50 bg-white px-6 pt-8 pb-4 text-base/6 text-warm-ink transition focus:border-warm-ink focus:ring-2 focus:ring-warm-ink focus:outline-hidden resize-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-5 left-6 origin-left text-base/6 text-warm-muted transition-all duration-200 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-not-placeholder-shown:text-warm-ink peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:font-semibold peer-focus:text-warm-ink"
      >
        {label}
        {required ? (
          <span className="text-forest-warm" aria-hidden="true">
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
    <div>
      <label
        htmlFor={id}
        className="block text-base/6 font-semibold text-warm-ink mb-2"
      >
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="block w-full rounded-full border-2 border-warm-ink/50 bg-white px-6 py-4 text-base/6 text-warm-ink transition focus:border-warm-ink focus:ring-2 focus:ring-warm-ink focus:outline-hidden appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_1rem_center] bg-no-repeat pr-12"
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
    <FadeIn className="rounded-[2.5rem] bg-warm-cream p-7 shadow-[0_24px_60px_rgb(42_24_10/0.08)] split:p-10">
      <form action={formAction}>
        <h2 className="type-display text-4xl">Send us a message</h2>

        {state.message ? (
          <p
            role="status"
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              state.success ? 'bg-sand text-warm-ink' : 'bg-red-50 text-red-800'
            }`}
          >
            {state.success
              ? "Thanks for getting in touch. We'll be in contact soon."
              : state.message}
          </p>
        ) : null}

        <div
          className={`mt-7 grid gap-4 ${
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
          <TextInput label="Phone (optional)" type="tel" name="phone" autoComplete="tel" />
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
          {pending ? 'Sending…' : 'Send Message'}
        </Button>
      </form>
    </FadeIn>
  )
}
