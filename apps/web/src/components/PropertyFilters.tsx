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
    'rounded-xl border border-line bg-white px-4 py-3 text-base text-ink transition focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none'

  const amenityButtonClasses = (active: boolean) =>
    clsx(
      'rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition',
      active
        ? 'bg-accent text-white ring-accent'
        : 'bg-white text-ink ring-line hover:ring-ink/30',
    )

  return (
    <div className="flex flex-col gap-6 split:flex-row split:items-start split:gap-10">
      <div className="split:w-48">
        <label htmlFor="bedrooms" className="text-sm font-medium text-muted">
          Bedrooms
        </label>
        <select
          id="bedrooms"
          value={currentBedrooms}
          onChange={(e) => updateFilters({ bedrooms: e.target.value || null })}
          className={clsx(selectClasses, 'mt-2 w-full')}
        >
          {bedroomOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-auto">
        <p className="text-sm font-medium text-muted">Amenities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {commonAmenities.map((amenity) => (
            <button
              key={amenity}
              type="button"
              aria-pressed={currentAmenities.includes(amenity)}
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
