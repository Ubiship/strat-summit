export const site = {
  name: 'Strathcona Summit Solutions',
  shortName: 'Strathcona Summit',
  tagline:
    'Property management, cleaning, and renovations across Vancouver Island.',
  description:
    'Vancouver Island property management, vacation rental cleaning, caretaking, and renovation services.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strathconasummit.com',
  contactEmail: 'hello@strathconasummit.com',
  phone: '(250) 000-0000',
} as const
