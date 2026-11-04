import { afterEach, describe, expect, it, vi } from 'vitest'
import { getBookingSiteUrl, getListingBookingUrl } from './booking'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getBookingSiteUrl', () => {
  it('defaults to the working Hostaway booking site', () => {
    vi.stubEnv('NEXT_PUBLIC_HOSTAWAY_BOOKING_URL', '')

    expect(getBookingSiteUrl()).toBe('https://210268-001.holidayfuture.com')
  })

  it('switches to the configured address, such as the branded domain', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_HOSTAWAY_BOOKING_URL',
      'https://book.strathconasummit.com/',
    )

    expect(getBookingSiteUrl()).toBe('https://book.strathconasummit.com')
  })
})

describe('getListingBookingUrl', () => {
  it('links to that listing on the booking site', () => {
    vi.stubEnv('NEXT_PUBLIC_HOSTAWAY_BOOKING_URL', '')

    expect(getListingBookingUrl('587033')).toBe(
      'https://210268-001.holidayfuture.com/listings/587033',
    )
  })
})
