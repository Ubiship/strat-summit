'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'

const bedroomOptions = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const priceRanges = [
  { value: '', label: 'Any price' },
  { value: '0-100', label: 'Under $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200-300', label: '$200 - $300' },
  { value: '300-500', label: '$300 - $500' },
  { value: '500-999999', label: '$500+' },
]

const commonAmenities = [
  'WiFi',
  'Kitchen',
  'Parking',
  'Hot tub',
  'Washer/Dryer',
  'Pet friendly',
  'Air conditioning',
  'Heating',
]

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentBedrooms = searchParams.get('bedrooms') || ''
  const currentPriceRange = searchParams.get('priceRange') || ''
  const currentAmenities = searchParams.get('amenities')?.split(',') || []

  function updateFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/stays?${params.toString()}`)
  }

  function toggleAmenity(amenity: string) {
    let newAmenities: string[]

    if (currentAmenities.includes(amenity)) {
      newAmenities = currentAmenities.filter((a) => a !== amenity)
    } else {
      newAmenities = [...currentAmenities, amenity]
    }

    updateFilters({
      amenities: newAmenities.length > 0 ? newAmenities.join(',') : null,
    })
  }

  const selectClasses =
    'rounded-2xl border-2 border-warm-ink/10 bg-white px-5 py-3.5 text-base font-medium text-warm-ink transition placeholder:text-warm-ink/40 focus:border-sun focus:outline-none'

  const amenityButtonClasses = (active: boolean) =>
    clsx(
      'rounded-full px-4 py-2.5 text-sm font-semibold transition',
      active
        ? 'bg-forest-warm text-warm-cream'
        : 'bg-sand text-warm-ink hover:bg-sun',
    )

  return (
    <div className="rounded-[2.75rem] bg-white p-8 shadow-[0_12px_32px_rgb(42_24_10/0.12)]">
      <h2 className="text-lg font-bold text-warm-ink">Filters</h2>

      <div className="mt-6 grid gap-6 split:grid-cols-2">
        <div>
          <label
            htmlFor="bedrooms"
            className="text-sm font-bold text-warm-ink/70"
          >
            Bedrooms
          </label>
          <select
            id="bedrooms"
            value={currentBedrooms}
            onChange={(e) => updateFilters({ bedrooms: e.target.value || null })}
            className={clsx(selectClasses, 'mt-1.5 w-full')}
          >
            {bedroomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="price-range"
            className="text-sm font-bold text-warm-ink/70"
          >
            Price range
          </label>
          <select
            id="price-range"
            value={currentPriceRange}
            onChange={(e) =>
              updateFilters({ priceRange: e.target.value || null })
            }
            className={clsx(selectClasses, 'mt-1.5 w-full')}
          >
            {priceRanges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-warm-ink/70">Amenities</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {commonAmenities.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={amenityButtonClasses(currentAmenities.includes(amenity))}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
