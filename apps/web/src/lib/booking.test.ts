import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildListingBookingUrl, buildSearchBookingUrl } from './booking'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildListingBookingUrl', () => {
  it('links to the listing on the branded booking domain by default', () => {
    vi.stubEnv('NEXT_PUBLIC_HOSTAWAY_BOOKING_URL', '')

    expect(buildListingBookingUrl('12345')).toBe(
      'https://book.strathconasummit.com/listings/12345',
    )
  })

  it('carries chosen dates and guests over to Hostaway', () => {
    expect(
      buildListingBookingUrl('12345', {
        checkIn: '2026-12-01',
        checkOut: '2026-12-08',
        guests: 4,
      }),
    ).toBe(
      'https://book.strathconasummit.com/listings/12345?start=2026-12-01&end=2026-12-08&numberOfGuests=4',
    )
  })

  it('uses the configured booking URL without doubling slashes', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_HOSTAWAY_BOOKING_URL',
      'https://example.holidayfuture.com/',
    )

    expect(buildListingBookingUrl('12345')).toBe(
      'https://example.holidayfuture.com/listings/12345',
    )
  })

  it('leaves out a guest count that is not a positive number', () => {
    expect(buildListingBookingUrl('12345', { guests: Number.NaN })).toBe(
      'https://book.strathconasummit.com/listings/12345',
    )
  })
})

describe('buildSearchBookingUrl', () => {
  it('sends a search with no dates to the Hostaway search page', () => {
    expect(buildSearchBookingUrl()).toBe(
      'https://book.strathconasummit.com/search',
    )
  })

  it('passes guests through from the search form', () => {
    expect(
      buildSearchBookingUrl({
        checkIn: '2026-12-01',
        checkOut: '2026-12-08',
        guests: '2',
      }),
    ).toBe(
      'https://book.strathconasummit.com/search?start=2026-12-01&end=2026-12-08&numberOfGuests=2',
    )
  })
})
