/**
 * Hostaway API Client
 *
 * Fetches properties, availability, pricing, and reviews from Hostaway.
 * Uses Bearer token authentication with the Hostaway API.
 */

// ============================================================================
// Types
// ============================================================================

export type HostawayPhoto = {
  url: string
  caption?: string
  isCover?: boolean
}

export type HostawayProperty = {
  id: number
  name: string
  description: string
  address: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  basePrice: number
  photos: HostawayPhoto[]
  amenities: string[]
  rating?: number
  reviewCount?: number
}

export type HostawayCalendarDay = {
  date: string // YYYY-MM-DD
  available: boolean
  price?: number
  minStay?: number
}

export type HostawayPriceQuote = {
  nightly: number
  cleaning: number
  service: number
  tax: number
  total: number
  currency: string
}

export type HostawayReview = {
  id: number
  listingId: number
  guestName: string
  rating: number
  comment: string
  createdAt: string
}

export type HostawayError = {
  message: string
  code?: string
}

// ============================================================================
// Client
// ============================================================================

const BASE_URL = 'https://api.hostaway.com/v1'

function getApiKey(): string {
  const key = process.env.HOSTAWAY_API_KEY
  if (!key) {
    throw new Error('HOSTAWAY_API_KEY environment variable is not set')
  }
  return key
}

function getAccountId(): string {
  const id = process.env.HOSTAWAY_ACCOUNT_ID
  if (!id) {
    throw new Error('HOSTAWAY_ACCOUNT_ID environment variable is not set')
  }
  return id
}

function getCheckoutBaseUrl(): string {
  const url = process.env.HOSTAWAY_CHECKOUT_BASE_URL
  if (!url) {
    throw new Error('HOSTAWAY_CHECKOUT_BASE_URL environment variable is not set')
  }
  return url
}

async function fetchHostaway<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const url = new URL(endpoint, BASE_URL).toString()
    const apiKey = getApiKey()

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Handle 404 Not Found
    if (response.status === 404) {
      return null
    }

    // Handle other non-2xx responses
    if (!response.ok) {
      console.error(`Hostaway API error: ${response.status} ${response.statusText}`)
      throw new Error(`Hostaway API returned ${response.status}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error('Hostaway fetch error:', error)
    throw error
  }
}

/**
 * Fetch all properties from Hostaway
 */
export async function getProperties(): Promise<HostawayProperty[]> {
  try {
    const response = await fetchHostaway<{ listings: HostawayProperty[] }>('/listings')

    if (!response) {
      return []
    }

    return response.listings || []
  } catch (error) {
    console.error('Failed to fetch properties:', error)
    return []
  }
}

/**
 * Fetch a single property by ID from Hostaway
 */
export async function getProperty(id: string): Promise<HostawayProperty | null> {
  try {
    const property = await fetchHostaway<HostawayProperty>(`/listings/${id}`)
    return property
  } catch (error) {
    console.error(`Failed to fetch property ${id}:`, error)
    return null
  }
}

/**
 * Fetch availability calendar for a property
 */
export async function getAvailability(
  listingId: string,
  startDate: string,
  endDate: string,
): Promise<HostawayCalendarDay[]> {
  try {
    const params = new URLSearchParams({
      listingId,
      startDate,
      endDate,
    })

    const response = await fetchHostaway<{ calendar: HostawayCalendarDay[] }>(
      `/calendar?${params.toString()}`,
    )

    if (!response) {
      return []
    }

    return response.calendar || []
  } catch (error) {
    console.error(
      `Failed to fetch availability for ${listingId}:`,
      error,
    )
    return []
  }
}

/**
 * Get pricing quote for a property
 */
export async function getPricing(
  listingId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): Promise<HostawayPriceQuote | null> {
  try {
    const payload = {
      listingId,
      checkIn,
      checkOut,
      guests,
    }

    const quote = await fetchHostaway<HostawayPriceQuote>(
      '/reservations/price',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )

    return quote
  } catch (error) {
    console.error(
      `Failed to fetch pricing for ${listingId}:`,
      error,
    )
    return null
  }
}

/**
 * Fetch reviews for a property or all properties
 */
export async function getReviews(listingId?: string): Promise<HostawayReview[]> {
  try {
    let endpoint = '/reviews'

    if (listingId) {
      const params = new URLSearchParams({ listingId })
      endpoint += `?${params.toString()}`
    }

    const response = await fetchHostaway<{ reviews: HostawayReview[] }>(endpoint)

    if (!response) {
      return []
    }

    return response.reviews || []
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return []
  }
}

/**
 * Build a checkout URL for Hostaway booking
 */
export function buildCheckoutUrl(
  listingId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): string {
  const baseUrl = getCheckoutBaseUrl()
  const params = new URLSearchParams({
    listingId,
    checkIn,
    checkOut,
    guests: guests.toString(),
  })

  return `${baseUrl}?${params.toString()}`
}
