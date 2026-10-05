import { NextRequest, NextResponse } from 'next/server'
import { getPricing } from '@/lib/hostaway'

/**
 * GET /api/pricing
 *
 * Fetch pricing quote from Hostaway API.
 * This route wraps the server-side getPricing function so client components
 * can fetch pricing without exposing API keys.
 *
 * Query params:
 * - listingId: string (required)
 * - checkIn: string (YYYY-MM-DD, required)
 * - checkOut: string (YYYY-MM-DD, required)
 * - guests: number (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams
    const listingId = await searchParams.get('listingId')
    const checkIn = await searchParams.get('checkIn')
    const checkOut = await searchParams.get('checkOut')
    const guestsParam = await searchParams.get('guests')

    // Validate required parameters
    if (!listingId || !checkIn || !checkOut || !guestsParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: listingId, checkIn, checkOut, guests' },
        { status: 400 }
      )
    }

    const guests = parseInt(guestsParam, 10)
    if (isNaN(guests) || guests < 1) {
      return NextResponse.json(
        { error: 'Invalid guests parameter: must be a positive number' },
        { status: 400 }
      )
    }

    // Fetch pricing from Hostaway
    const quote = await getPricing(listingId, checkIn, checkOut, guests)

    if (!quote) {
      return NextResponse.json(
        { error: 'Unable to fetch pricing for the specified dates' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Pricing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
