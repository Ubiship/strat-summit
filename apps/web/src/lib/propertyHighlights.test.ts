import { describe, it, expect } from 'vitest'

import type { HostawayProperty } from './hostaway'
import { getPropertyHighlights } from './propertyHighlights'

function property(overrides: Partial<HostawayProperty> = {}): HostawayProperty {
  return {
    id: 1,
    name: 'Alpine Retreat',
    description: '',
    address: '',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 8,
    basePrice: 250,
    photos: [],
    amenities: [],
    ...overrides,
  }
}

describe('getPropertyHighlights', () => {
  it('carries bedroom, bathroom and guest counts through', () => {
    expect(getPropertyHighlights(property())).toMatchObject({
      bedrooms: 3,
      bathrooms: 2,
      guests: 8,
    })
  })

  it('detects a private hot tub from amenities', () => {
    expect(
      getPropertyHighlights(property({ amenities: ['WiFi', 'Hot tub'] })).hotTub,
    ).toBe(true)
    expect(
      getPropertyHighlights(property({ amenities: ['Private Jacuzzi'] })).hotTub,
    ).toBe(true)
  })

  it('does not count a shared hot tub as private', () => {
    expect(
      getPropertyHighlights(property({ amenities: ['Shared hot tub'] })).hotTub,
    ).toBe(false)
    expect(
      getPropertyHighlights(property({ amenities: ['Communal hot tub'] })).hotTub,
    ).toBe(false)
  })

  it('detects pet-friendly listings', () => {
    expect(
      getPropertyHighlights(property({ amenities: ['Pets allowed'] })).petFriendly,
    ).toBe(true)
    expect(
      getPropertyHighlights(property({ amenities: ['Pet-friendly'] })).petFriendly,
    ).toBe(true)
  })

  it('does not treat a no-pets rule as pet-friendly', () => {
    expect(
      getPropertyHighlights(property({ amenities: ['No pets allowed'] }))
        .petFriendly,
    ).toBe(false)
    expect(
      getPropertyHighlights(property({ amenities: ['Pets not allowed'] }))
        .petFriendly,
    ).toBe(false)
  })

  it('normalises the property type to condo, chalet or townhouse', () => {
    expect(getPropertyHighlights(property({ propertyType: 'Condominium' })).type).toBe('condo')
    expect(getPropertyHighlights(property({ propertyType: 'Chalet' })).type).toBe('chalet')
    expect(getPropertyHighlights(property({ propertyType: 'Townhome' })).type).toBe('townhouse')
  })

  it('falls back to the listing name when no type is set', () => {
    expect(getPropertyHighlights(property({ name: 'Cozy Bear Chalet' })).type).toBe('chalet')
    expect(getPropertyHighlights(property({ name: 'Black Dog Condo #12' })).type).toBe('condo')
  })

  it('prefers the explicit type over the name', () => {
    expect(
      getPropertyHighlights(property({ name: 'Chalet View Condo', propertyType: 'Condominium' })).type,
    ).toBe('condo')
  })

  it('omits the type when it is missing or unrecognised', () => {
    expect(getPropertyHighlights(property()).type).toBeUndefined()
    expect(getPropertyHighlights(property({ propertyType: 'Yurt' })).type).toBeUndefined()
  })
})
