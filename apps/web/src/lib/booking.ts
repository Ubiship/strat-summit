// Guests browse on this site and book on Hostaway. Every link out goes through
// this file. It runs in the browser, so the variable must stay NEXT_PUBLIC_.
const DEFAULT_BOOKING_SITE_URL = 'https://book.strathconasummit.com'

export function getBookingSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HOSTAWAY_BOOKING_URL || DEFAULT_BOOKING_SITE_URL
  ).replace(/\/+$/, '')
}

export function getListingBookingUrl(listingId: string): string {
  return `${getBookingSiteUrl()}/listings/${encodeURIComponent(listingId)}`
}
