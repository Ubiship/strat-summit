import type {
  HostawayCalendarDay,
  HostawayProperty,
  HostawayReview,
} from '@/lib/hostaway'

// Local-development stand-in for Hostaway, used only when running `next dev`
// without HOSTAWAY_API_KEY so every section of the site can be previewed.
export function isSampleMode() {
  return (
    process.env.NODE_ENV === 'development' && !process.env.HOSTAWAY_API_KEY
  )
}

const photos = (cover: string, second: string) => [
  { url: cover, isCover: true },
  { url: second },
  { url: '/HeroImage.jpg' },
  { url: '/Renos.png' },
  { url: '/PropertyManagment.png' },
]

export const sampleProperties: HostawayProperty[] = [
  {
    id: 101,
    name: 'Raven Lodge Chalet',
    description:
      'A warm, timber-framed chalet steps from the Raven chair. Vaulted ceilings, a wood stove, and big windows onto the trees.\n\nSki-in / ski-out in good snow years.',
    address: 'Fosters Place, Mount Washington, BC',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 10,
    basePrice: 450,
    photos: photos('/HeroImage.jpg', '/Renos.png'),
    amenities: ['WiFi', 'Kitchen', 'Hot tub', 'Pets allowed', 'Parking', 'Washer/Dryer'],
    propertyType: 'Chalet',
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 102,
    name: 'Alpine Village Condo',
    description:
      'A bright two-bedroom condo in the alpine village, a short walk to the lifts and the patio.',
    address: 'Alpine Village, Mount Washington, BC',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 6,
    basePrice: 220,
    photos: photos('/PropertyManagment.png', '/HeroImage.jpg'),
    amenities: ['WiFi', 'Kitchen', 'Shared hot tub', 'No pets allowed'],
    propertyType: 'Condominium',
    rating: 4.7,
    reviewCount: 21,
  },
  {
    id: 103,
    name: 'Strathcona Townhouse',
    description:
      'Three levels, room for the whole crew, and a private hot tub on the deck.',
    address: 'Washington Way, Mount Washington, BC',
    bedrooms: 3,
    bathrooms: 2.5,
    maxGuests: 8,
    basePrice: 320,
    photos: photos('/Renos.png', '/HeroImage.jpg'),
    amenities: ['WiFi', 'Hot tub', 'Parking'],
    propertyType: 'Townhome',
    rating: 4.8,
    reviewCount: 12,
  },
  {
    id: 104,
    name: 'Boston Ridge Retreat',
    description: 'A cozy one-bedroom with mountain views, perfect for two.',
    address: 'Boston Ridge, Mount Washington, BC',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 160,
    photos: photos('/HeroImage.jpg', '/PropertyManagment.png'),
    amenities: ['WiFi', 'Kitchen', 'Pet-friendly'],
    propertyType: 'Condo',
  },
]

export const sampleReviews: HostawayReview[] = [
  {
    id: 1,
    listingId: 101,
    guestName: 'Sarah M.',
    rating: 5,
    comment:
      'Spotless, warm, and the hot tub after a day on the hill was perfect. The team answered every question within minutes.',
    createdAt: '2026-02-14',
  },
  {
    id: 2,
    listingId: 102,
    guestName: 'James T.',
    rating: 5,
    comment:
      'Best family ski trip we have had. Everything was ready when we arrived and the walk to the lifts was easy.',
    createdAt: '2026-01-20',
  },
  {
    id: 3,
    listingId: 103,
    guestName: 'Priya K.',
    rating: 4,
    comment:
      'Great space for our group of eight. Would book direct again.',
    createdAt: '2025-12-30',
  },
  {
    id: 4,
    listingId: 101,
    guestName: 'Dan R.',
    rating: 5,
    comment:
      'Local hosts who really know the mountain. Their dinner recommendations were spot on.',
    createdAt: '2025-12-02',
  },
  {
    id: 5,
    listingId: 104,
    guestName: 'Elena V.',
    rating: 5,
    comment:
      'Quiet, cozy, and exactly as pictured. We brought our dog and felt completely welcome.',
    createdAt: '2025-11-18',
  },
  {
    id: 6,
    listingId: 103,
    guestName: 'Marcus L.',
    rating: 5,
    comment:
      'Check-in was effortless. Clear instructions, a warm house, and fresh linens for everyone.',
    createdAt: '2025-10-27',
  },
]

export function sampleAvailability(
  startDate: string,
  endDate: string,
): HostawayCalendarDay[] {
  let days: HostawayCalendarDay[] = []
  let end = new Date(endDate)
  for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      date: d.toISOString().slice(0, 10),
      available: d.getDate() % 7 > 1,
    })
  }
  return days
}
