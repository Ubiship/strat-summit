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

const propertyTypes = [
  { value: '', label: 'All types' },
  { value: 'condo', label: 'Condo' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'townhouse', label: 'Townhouse' },
]

const amenityFilters = ['Hot tub', 'Pet friendly']

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentBedrooms = searchParams.get('bedrooms') || ''
  const currentPropertyType = searchParams.get('propertyType') || ''
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
        : 'bg-sand text-warm-ink hover:bg-forest-warm/10',
    )

  return (
    <div className="rounded-[2.75rem] bg-white p-6 shadow-[0_12px_32px_rgb(42_24_10/0.12)] sm:p-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="min-w-0 flex-1 sm:flex-none">
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
            className={clsx(selectClasses, 'mt-1.5 w-full min-w-0 sm:w-32')}
          >
            {bedroomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 flex-1 sm:flex-none">
          <label
            htmlFor="property-type"
            className="text-sm font-bold text-warm-ink/70"
          >
            Property type
          </label>
          <select
            id="property-type"
            value={currentPropertyType}
            onChange={(e) =>
              updateFilters({ propertyType: e.target.value || null })
            }
            className={clsx(selectClasses, 'mt-1.5 w-full min-w-0 sm:w-36')}
          >
            {propertyTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto sm:flex-1">
          <p className="text-sm font-bold text-warm-ink/70">Amenities</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {amenityFilters.map((amenity) => (
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
    </div>
  )
}
