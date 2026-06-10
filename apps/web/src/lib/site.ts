export const site = {
  name: 'Strathcona Summit Solutions',
  shortName: 'Strathcona Summit',
  tagline: 'Reliable Cleaning and Renovation Specialists',
  description:
    'Vancouver Island property management, vacation rental cleaning, caretaking, and renovation services.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strathconasummit.com',
  contactEmail: 'hello@strathconasummit.com',
  phone: '(250) 000-0000',
  logos: {
    icon: '/STRATLOGO-ICON.png',
    full: '/STRAT.LOGO.png',
  },
  images: {
    hero: '/HeroImage.jpg',
    propertyManagement: '/PropertyManagment.png',
    renovations: '/Renos.png',
  },
} as const
