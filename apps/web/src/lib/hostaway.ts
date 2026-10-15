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

// Cache for OAuth2 access token (valid for ~2 years)
let cachedAccessToken: string | null = null
let tokenExpiresAt: number = 0

function getClientSecret(): string {
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

/**
 * Get an OAuth2 access token using client credentials flow.
 * Tokens are cached and reused until they expire (~2 years).
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 300000) {
    return cachedAccessToken
  }

  const clientId = getAccountId()
  const clientSecret = getClientSecret()

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'general',
  })

  const response = await fetch(`${BASE_URL}/accessTokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Hostaway] Failed to get access token:', response.status, error)
    throw new Error(`Failed to authenticate with Hostaway: ${response.status}`)
  }

  const data = await response.json()
  cachedAccessToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000

  // Wait 2 seconds as per Hostaway docs (token valid 1 second after creation)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return cachedAccessToken!
}

async function fetchHostaway<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    // Construct URL properly - endpoint should not have leading slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const url = `${BASE_URL}/${cleanEndpoint}`
    const accessToken = await getAccessToken()

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
      const errorBody = await response.text()
      console.error(`[Hostaway] API error: ${response.status} - ${errorBody}`)
      throw new Error(`Hostaway API returned ${response.status}`)
    }

    return (await response.json()) as T
  } catch (error) {
    console.error('[Hostaway] Fetch error:', error)
    throw error
  }
}

// Raw Hostaway listing type from API
type HostawayListingRaw = {
  id: number
  name: string
  internalListingName?: string
  description?: string
  address?: string
  city?: string
  state?: string
  countryCode?: string
  zipcode?: string
  // Hostaway uses bedroomsNumber/bathroomsNumber, not bedrooms/bathrooms
  bedroomsNumber?: number
  bathroomsNumber?: number
  bedsNumber?: number
  personCapacity?: number
  price?: number
  currencyCode?: string
  listingImages?: Array<{
    url: string
    caption?: string
    sortOrder?: number
  }>
  amenities?: string[]
  starRating?: number
  reviewsCount?: number
}

/**
 * Transform raw Hostaway listing to our property type
 */
function transformListing(raw: HostawayListingRaw): HostawayProperty {
  return {
    id: raw.id,
    name: raw.name || raw.internalListingName || 'Unnamed Property',
    description: raw.description || '',
    address: [raw.address, raw.city, raw.state].filter(Boolean).join(', '),
    bedrooms: raw.bedroomsNumber || 0,
    bathrooms: raw.bathroomsNumber || 0,
    maxGuests: raw.personCapacity || 0,
    basePrice: raw.price || 0,
    photos: (raw.listingImages || [])
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((img, index) => ({
        url: img.url,
        caption: img.caption,
        isCover: index === 0, // First image after sorting is the cover
      })),
    amenities: raw.amenities || [],
    rating: raw.starRating,
    reviewCount: raw.reviewsCount,
  }
}

/**
 * Fetch all properties from Hostaway
 */
export async function getProperties(): Promise<HostawayProperty[]> {
  try {
    // includeResources=1 is required to get listing images
    const response = await fetchHostaway<{
      status: string
      result: HostawayListingRaw[]
    }>('/listings?includeResources=1')

    if (!response || response.status !== 'success') {
      return []
    }

    return (response.result || []).map(transformListing)
  } catch (error) {
    console.error('[Hostaway] Failed to fetch properties:', error)
    return []
  }
}

/**
 * Fetch a single property by ID from Hostaway.
 * @param id - The Hostaway listing ID
 * @returns The property object, or null if not found or an error occurs.
 *          Null returns from API errors are logged to console.error for debugging.
 */
export async function getProperty(id: string): Promise<HostawayProperty | null> {
  try {
    // includeResources=1 is required to get listing images
    const response = await fetchHostaway<{
      status: string
      result: HostawayListingRaw
    }>(`/listings/${id}?includeResources=1`)

    if (!response || response.status !== 'success' || !response.result) {
      return null
    }

    return transformListing(response.result)
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
 * Get pricing quote for a property.
 * @param listingId - The Hostaway listing ID
 * @param checkIn - Check-in date (YYYY-MM-DD format)
 * @param checkOut - Check-out date (YYYY-MM-DD format)
 * @param guests - Number of guests
 * @returns The pricing quote with breakdown, or null if not found or an error occurs.
 *          Null returns from API errors are logged to console.error for debugging.
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

// Raw Hostaway review type from API
type HostawayReviewRaw = {
  id: number
  listingMapId?: number
  reservationId?: number
  guestName?: string
  reviewerName?: string
  rating?: number // 0-10 scale
  status?: string // 'pending', 'awaiting', 'published', etc.
  type?: string // 'guest-to-host', 'host-to-guest'
  text?: string
  publicReview?: string
  submittedAt?: string
  insertedOn?: string
  createdAt?: string
}

/**
 * Transform raw Hostaway review to our review type.
 * Converts 10-point rating scale to 5-point scale.
 * Extracts first name only for guest privacy.
 */
function transformReview(raw: HostawayReviewRaw, listingId?: number): HostawayReview {
  // Convert 0-10 rating to 0-5 scale (round to nearest 0.5)
  const rating10 = raw.rating || 10
  const rating5 = Math.round((rating10 / 2) * 2) / 2 // e.g., 10 -> 5, 8 -> 4, 9 -> 4.5

  // Extract first name only for privacy (e.g., "Andrew Peterson" -> "Andrew")
  const fullName = raw.guestName || raw.reviewerName || ''
  const firstName = fullName.split(' ')[0] || 'Guest'

  return {
    id: raw.id,
    listingId: raw.listingMapId || listingId || 0,
    guestName: firstName,
    rating: rating5,
    comment: raw.publicReview || raw.text || '',
    createdAt: raw.submittedAt || raw.insertedOn || raw.createdAt || new Date().toISOString(),
  }
}

/**
 * Fetch reviews for a property or all properties.
 * Only returns published guest-to-host reviews with actual content.
 * Reviews are sorted by most recent first.
 * @param listingId - Optional Hostaway listing ID to filter reviews
 * @returns Array of reviews, or empty array if none found or error occurs.
 */
export async function getReviews(listingId?: string): Promise<HostawayReview[]> {
  try {
    // Build query params - request sorting by submittedAt descending (most recent first)
    const params = new URLSearchParams({
      sortOrder: 'desc',
      sortBy: 'submittedAt',
    })
    if (listingId) {
      params.set('listingId', listingId)
    }

    const endpoint = `/reviews?${params.toString()}`

    const response = await fetchHostaway<{
      status: string
      result: HostawayReviewRaw[]
    }>(endpoint)

    if (!response || response.status !== 'success') {
      return []
    }

    // Filter to only published guest-to-host reviews with actual content
    const publishedReviews = (response.result || []).filter(
      (r) =>
        r.status === 'published' &&
        r.type === 'guest-to-host' &&
        r.publicReview
    )

    // Transform and ensure client-side sort as backup (most recent first)
    const transformedReviews = publishedReviews.map((raw) =>
      transformReview(raw, listingId ? parseInt(listingId) : undefined)
    )

    return transformedReviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
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
