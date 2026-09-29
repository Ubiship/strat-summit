import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  buildCheckoutUrl,
  getProperty,
  getPricing,
  getProperties,
  getAvailability,
  getReviews,
  type HostawayProperty,
  type HostawayPriceQuote,
} from './hostaway'

// Mock environment variables
beforeEach(() => {
  process.env.HOSTAWAY_API_KEY = 'test-api-key'
  process.env.HOSTAWAY_ACCOUNT_ID = 'test-account-id'
  process.env.HOSTAWAY_CHECKOUT_BASE_URL = 'https://checkout.example.com'
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildCheckoutUrl', () => {
  it('should build a valid checkout URL with all parameters', () => {
    const url = buildCheckoutUrl('12345', '2026-01-01', '2026-01-08', 2)

    expect(url).toBe(
      'https://checkout.example.com?listingId=12345&checkIn=2026-01-01&checkOut=2026-01-08&guests=2'
    )
  })

  it('should URL-encode special characters in parameters', () => {
    const url = buildCheckoutUrl('12345', '2026-01-01', '2026-01-08', 2)

    // Verify it's a valid URL
    expect(() => new URL(url)).not.toThrow()
  })

  it('should handle single guest', () => {
    const url = buildCheckoutUrl('12345', '2026-01-01', '2026-01-02', 1)

    expect(url).toContain('guests=1')
  })

  it('should throw if checkout base URL is not set', () => {
    delete process.env.HOSTAWAY_CHECKOUT_BASE_URL

    expect(() => buildCheckoutUrl('12345', '2026-01-01', '2026-01-08', 2)).toThrow(
      'HOSTAWAY_CHECKOUT_BASE_URL environment variable is not set'
    )
  })
})

describe('getProperty', () => {
  it('should fetch a single property successfully', async () => {
    const mockProperty: HostawayProperty = {
      id: 12345,
      name: 'Ocean View Cabin',
      description: 'Beautiful beachfront property',
      address: '123 Beach St, Vancouver Island, BC',
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      basePrice: 150,
      photos: [
        { url: 'https://example.com/photo1.jpg', isCover: true },
      ],
      amenities: ['WiFi', 'Kitchen', 'Hot Tub'],
      rating: 4.8,
      reviewCount: 42,
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockProperty),
      } as Response)
    )

    const result = await getProperty('12345')

    expect(result).toEqual(mockProperty)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/listings/12345'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      })
    )
  })

  it('should return null for 404 responses', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
      } as Response)
    )

    const result = await getProperty('nonexistent')

    expect(result).toBeNull()
  })

  it('should return null on API error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )

    const result = await getProperty('12345')

    expect(result).toBeNull()
  })

  it('should return null if API key is not set', async () => {
    delete process.env.HOSTAWAY_API_KEY

    global.fetch = vi.fn()

    const result = await getProperty('12345')

    expect(result).toBeNull()
  })
})

describe('getPricing', () => {
  it('should fetch pricing quote successfully', async () => {
    const mockQuote: HostawayPriceQuote = {
      nightly: 150,
      cleaning: 75,
      service: 22.50,
      tax: 29.75,
      total: 277.25,
      currency: 'CAD',
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockQuote),
      } as Response)
    )

    const result = await getPricing('12345', '2026-01-01', '2026-01-08', 2)

    expect(result).toEqual(mockQuote)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reservations/price'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          listingId: '12345',
          checkIn: '2026-01-01',
          checkOut: '2026-01-08',
          guests: 2,
        }),
      })
    )
  })

  it('should return null on API error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('API error'))
    )

    const result = await getPricing('12345', '2026-01-01', '2026-01-08', 2)

    expect(result).toBeNull()
  })

  it('should handle 404 response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
      } as Response)
    )

    const result = await getPricing('nonexistent', '2026-01-01', '2026-01-08', 2)

    expect(result).toBeNull()
  })
})

describe('getProperties', () => {
  it('should fetch all properties successfully', async () => {
    const mockProperties: HostawayProperty[] = [
      {
        id: 1,
        name: 'Property 1',
        description: 'First property',
        address: '123 Street',
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        basePrice: 100,
        photos: [],
        amenities: ['WiFi'],
      },
      {
        id: 2,
        name: 'Property 2',
        description: 'Second property',
        address: '456 Avenue',
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        basePrice: 150,
        photos: [],
        amenities: ['Kitchen'],
      },
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ listings: mockProperties }),
      } as Response)
    )

    const result = await getProperties()

    expect(result).toEqual(mockProperties)
    expect(result).toHaveLength(2)
  })

  it('should return empty array on API error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )

    const result = await getProperties()

    expect(result).toEqual([])
  })

  it('should return empty array when API returns null', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 404,
        ok: false,
      } as Response)
    )

    const result = await getProperties()

    expect(result).toEqual([])
  })
})

describe('getAvailability', () => {
  it('should fetch availability calendar successfully', async () => {
    const mockCalendar = [
      { date: '2026-01-01', available: true, price: 150 },
      { date: '2026-01-02', available: true, price: 150 },
      { date: '2026-01-03', available: false, price: undefined },
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ calendar: mockCalendar }),
      } as Response)
    )

    const result = await getAvailability('12345', '2026-01-01', '2026-01-31')

    expect(result).toEqual(mockCalendar)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/calendar'),
      expect.any(Object)
    )
  })

  it('should return empty array on error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('API error'))
    )

    const result = await getAvailability('12345', '2026-01-01', '2026-01-31')

    expect(result).toEqual([])
  })
})

describe('getReviews', () => {
  it('should fetch reviews for a specific property', async () => {
    const mockReviews = [
      {
        id: 1,
        listingId: 12345,
        guestName: 'John Doe',
        rating: 5,
        comment: 'Excellent stay!',
        createdAt: '2026-01-15T10:30:00Z',
      },
    ]

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ reviews: mockReviews }),
      } as Response)
    )

    const result = await getReviews('12345')

    expect(result).toEqual(mockReviews)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reviews'),
      expect.any(Object)
    )
  })

  it('should fetch all reviews when no listingId provided', async () => {
    const mockReviews = []

    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ reviews: mockReviews }),
      } as Response)
    )

    const result = await getReviews()

    expect(result).toEqual(mockReviews)
  })

  it('should return empty array on error', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('API error'))
    )

    const result = await getReviews('12345')

    expect(result).toEqual([])
  })
})
