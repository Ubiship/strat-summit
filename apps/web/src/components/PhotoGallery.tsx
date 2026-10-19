'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import type { HostawayPhoto } from '@/lib/hostaway'

type PhotoGalleryProps = {
  photos: HostawayPhoto[]
  propertyName: string
}

export function PhotoGallery({ photos, propertyName }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Close lightbox on Escape key. Hooks must run before the early return.
  useEffect(() => {
    if (!lightboxOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [lightboxOpen])

  if (photos.length === 0) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-[1.5rem] bg-mist">
        <p className="text-lg text-ink/40">No photos available</p>
      </div>
    )
  }

  const mainPhoto = photos[0]
  const thumbnails = photos.slice(1, 5)

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <>
      <div className="relative grid gap-2 overflow-hidden rounded-[1.75rem] split:grid-cols-2">
        {/* Main photo */}
        <button
          onClick={() => openLightbox(0)}
          className="group relative aspect-[4/3] overflow-hidden split:col-span-1 split:row-span-2"
        >
          <Image
            src={mainPhoto.url}
            alt={mainPhoto.caption || propertyName}
            fill
            className="object-cover transition group-hover:scale-[1.03] duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>

        {/* Thumbnails */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {thumbnails.map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index + 1)}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || `${propertyName} photo ${index + 2}`}
                  fill
                  className="object-cover transition group-hover:scale-[1.03] duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </button>
            ))}
          </div>
        )}

        {/* View all photos button */}
        {photos.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 rounded-full bg-white px-4.5 py-2.5 text-sm font-medium text-ink shadow-[0_4px_16px_rgb(0_0_0/0.12)] transition hover:bg-mist"
          >
            View all {photos.length} photos
          </button>
        )}
      </div>

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-white/95 p-4 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full bg-white text-2xl text-ink ring-1 ring-line transition hover:bg-mist"
              aria-label="Close lightbox"
            >
              ×
            </button>

            {/* Main image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
              <Image
                src={photos[currentPhotoIndex].url}
                alt={
                  photos[currentPhotoIndex].caption ||
                  `${propertyName} photo ${currentPhotoIndex + 1}`
                }
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl text-ink ring-1 ring-line transition hover:bg-mist"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl text-ink ring-1 ring-line transition hover:bg-mist"
                  aria-label="Next photo"
                >
                  ›
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-line">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
