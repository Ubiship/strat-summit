// Guests browse on this site and book on Hostaway. Every link out goes through
// this file. It runs in the browser, so the variable must stay NEXT_PUBLIC_.
const DEFAULT_BOOKING_URL = 'https://book.strathconasummit.com'

type StaySelection = {
  checkIn?: string
  checkOut?: string
  guests?: number | string
}

function buildBookingUrl(path: string, stay: StaySelection = {}): string {
  const base = (
    process.env.NEXT_PUBLIC_HOSTAWAY_BOOKING_URL || DEFAULT_BOOKING_URL
  ).replace(/\/+$/, '')

  const params = new URLSearchParams()
  if (stay.checkIn) params.set('start', stay.checkIn)
  if (stay.checkOut) params.set('end', stay.checkOut)
  const guests = Number(stay.guests)
  if (guests > 0) params.set('numberOfGuests', guests.toString())

  const query = params.toString()
  return `${base}${path}${query ? `?${query}` : ''}`
}

export function buildListingBookingUrl(
  listingId: string,
  stay?: StaySelection,
): string {
  return buildBookingUrl(`/listings/${encodeURIComponent(listingId)}`, stay)
}

export function buildSearchBookingUrl(stay?: StaySelection): string {
  return buildBookingUrl('/search', stay)
}
