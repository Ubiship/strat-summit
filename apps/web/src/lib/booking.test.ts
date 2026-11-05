import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBookingSiteUrl, getListingBookingUrl } from './booking'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getBookingSiteUrl', () => {
  it('defaults to the branded Hostaway booking site', () => {
    vi.stubEnv('NEXT_PUBLIC_HOSTAWAY_BOOKING_URL', '')

    expect(getBookingSiteUrl()).toBe('https://book.strathconasummit.com')
  })

  it('switches to the configured address and drops a trailing slash', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_HOSTAWAY_BOOKING_URL',
      'https://210268-001.holidayfuture.com/',
    )

    expect(getBookingSiteUrl()).toBe('https://210268-001.holidayfuture.com')
  })
})

describe('getListingBookingUrl', () => {
  it('links to that listing on the booking site', () => {
    vi.stubEnv('NEXT_PUBLIC_HOSTAWAY_BOOKING_URL', '')

    expect(getListingBookingUrl('587033')).toBe(
      'https://book.strathconasummit.com/listings/587033',
    )
  })
})
