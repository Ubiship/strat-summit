export const site = {
  name: 'Strathcona Summit Solutions',
  shortName: 'Strathcona Summit',
  tagline: 'Reliable Cleaning and Renovation Specialists',
  description:
    'Vancouver Island property management, vacation rental cleaning, caretaking, and renovation services.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://strathconasummit.com',
  contactEmail: 'hello@strathconasummit.com',
  phone: '(250) 000-0000',
  // Shown instead of a property's street address, which guests get after booking
  propertyArea: 'Mount Washington, Vancouver Island',
  logos: {
    icon: '/STRATLOGO-ICON.png',
    mark: '/logo-mark.png',
    full: '/STRAT.LOGO.png',
  },
  images: {
    hero: '/HeroImage.jpg',
    renovations: '/Renos.png',
    hosts: '/Strat summit images/About Us Homepage Image.jpeg',
    joel: '/Strat summit images/Joel Headshot.JPG',
    amanda: '/Strat summit images/Amanda Headshot.JPG',
    propertyManagement: '/Strat summit images/Property Management 1.jpg',
    mountWashington: '/Strat summit images/Mt Washington Info 1.jpg',
  },
} as const
