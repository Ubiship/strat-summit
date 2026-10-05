import { NextRequest, NextResponse } from 'next/server'
import { getAvailability } from '@/lib/hostaway'

/**
 * GET /api/hostaway/availability
 *
 * Fetch availability calendar from Hostaway API.
 * This route wraps the server-side getAvailability function so client components
 * can fetch availability without exposing API keys.
 *
 * Query params:
 * - listingId: string (required)
 * - startDate: string (YYYY-MM-DD, required)
 * - endDate: string (YYYY-MM-DD, required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = await request.nextUrl.searchParams
    const listingId = await searchParams.get('listingId')
    const startDate = await searchParams.get('startDate')
    const endDate = await searchParams.get('endDate')

    // Validate required parameters
    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: listingId, startDate, endDate' },
        { status: 400 }
      )
    }

    // Basic date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format: dates must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      return NextResponse.json(
        { error: 'Invalid date range: startDate must be before endDate' },
        { status: 400 }
      )
    }

    // Fetch availability from Hostaway
    const availability = await getAvailability(listingId, startDate, endDate)

    return NextResponse.json({ availability })
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
