'use server'

import { Resend } from 'resend'

import { site } from '@/lib/site'

export type ContactFormState = {
  success: boolean
  message: string
}

const serviceLabels: Record<string, string> = {
  pm: 'Property management / cleaning',
  reno: 'Renovation / construction',
  both: 'Both',
  other: 'Not sure yet',
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const service = String(formData.get('service') ?? '').trim()

  if (!name || !email || !message) {
    return {
      success: false,
      message: 'Please fill in your name, email, and message.',
    }
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_EMAIL ?? site.contactEmail
  const from =
    process.env.RESEND_FROM_EMAIL ?? `${site.shortName} <onboarding@resend.dev>`

  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured')
    return {
      success: false,
      message:
        'Email is not configured yet. Please email us directly or try again later.',
    }
  }

  const serviceLine = service
    ? serviceLabels[service] ?? service
    : 'Not specified'

  const body = [
    `New contact form submission from ${site.shortName}`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    location ? `Property location: ${location}` : null,
    `Service interest: ${serviceLine}`,
    '',
    'Message:',
    message,
  ]
    .filter(Boolean)
    .join('\n')

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `[${site.shortName}] Contact from ${name}`,
    text: body,
  })

  if (error) {
    console.error('Resend error:', error)
    return {
      success: false,
      message: 'Something went wrong sending your message. Please try again.',
    }
  }

  return {
    success: true,
    message: 'Thanks — we received your message and will get back to you soon.',
  }
}

export type NewsletterState = {
  success: boolean
  message: string
}

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  // If audience ID is not configured, log and return success (dev environment)
  if (!audienceId) {
    console.log('Newsletter subscription (dev mode):', email)
    return {
      success: true,
      message: 'Thanks for subscribing! Check your inbox to confirm.',
    }
  }

  // If API key is not configured, log and return success
  if (!apiKey) {
    console.log('Newsletter subscription (no API key):', email)
    return {
      success: true,
      message: 'Thanks for subscribing! Check your inbox to confirm.',
    }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.contacts.create({
      email,
      audienceId,
    })

    if (error) {
      // Handle duplicate email gracefully
      if (error.message?.includes('already exists') || (error as any).code === 'duplicate') {
        console.log('Newsletter subscription: email already subscribed', email)
        return {
          success: true,
          message: 'Thanks for subscribing! Check your inbox to confirm.',
        }
      }

      console.error('Resend contacts error:', error)
      return {
        success: false,
        message: 'Something went wrong. Please try again later.',
      }
    }

    return {
      success: true,
      message: 'Thanks for subscribing! Check your inbox to confirm.',
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    }
  }
}
