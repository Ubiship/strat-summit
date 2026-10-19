import type { HostawayProperty } from '@/lib/hostaway'

export type PropertyType = 'condo' | 'chalet' | 'townhouse'

export type PropertyHighlights = {
  bedrooms: number
  bathrooms: number
  guests: number
  hotTub: boolean
  petFriendly: boolean
  type?: PropertyType
}

const HOT_TUB = /hot\s*tub|jacuzzi|whirlpool/i
const SHARED = /shared|communal/i
const PETS = /pets?[\s-]*(allowed|friendly|welcome)/i
const NO_PETS = /\bno pets\b|pets? not allowed/i

const TYPES: [RegExp, PropertyType][] = [
  [/town\s*(house|home)/i, 'townhouse'],
  [/condo/i, 'condo'],
  [/chalet|cabin/i, 'chalet'],
]

// Highlights are read from the listing's own amenities, so they reflect what
// the owner has actually set in Hostaway rather than marketing copy.
export function getPropertyHighlights(
  property: HostawayProperty,
): PropertyHighlights {
  let amenities = property.amenities ?? []

  return {
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    guests: property.maxGuests,
    hotTub: amenities.some((a) => HOT_TUB.test(a) && !SHARED.test(a)),
    petFriendly: amenities.some((a) => PETS.test(a) && !NO_PETS.test(a)),
    type: property.propertyType
      ? TYPES.find(([pattern]) => pattern.test(property.propertyType!))?.[1]
      : undefined,
  }
}
