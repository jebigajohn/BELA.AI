'use client'

import { MapPin, Navigation, Clock } from 'lucide-react'

interface StudioInfoProps {
  name: string
  rating: number
  reviewCount: number
  address: string
  googleMapsUrl: string
  openingHours: {
    isOpen: boolean
    closesAt?: string
    opensAt?: string
  }
}

export default function StudioInfo({
  name,
  rating,
  reviewCount,
  address,
  googleMapsUrl,
  openingHours,
}: StudioInfoProps) {
  return (
    <div className="space-y-4">
      {/* Studio Name */}
      <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
        {name}
      </h1>

      {/* Info Tags Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Rating */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
          <span className="text-yellow-500">★</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {rating.toFixed(1)}
          </span>
          <span className="text-neutral-500">({reviewCount})</span>
        </div>

        {/* Open/Closed Status */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
          <Clock
            size={14}
            className={openingHours.isOpen ? 'text-green-500' : 'text-red-500'}
          />
          {openingHours.isOpen ? (
            <span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                Geöffnet
              </span>
              {openingHours.closesAt && (
                <span className="text-neutral-500">
                  {' '}
                  – schließt um {openingHours.closesAt}
                </span>
              )}
            </span>
          ) : (
            <span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                Geschlossen
              </span>
              {openingHours.opensAt && (
                <span className="text-neutral-500">
                  {' '}
                  – öffnet um {openingHours.opensAt}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
          <MapPin size={14} className="text-neutral-500" />
          <span className="text-neutral-700 dark:text-neutral-300 text-sm">
            {address}
          </span>
        </div>

        {/* Route Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full transition-colors"
        >
          <Navigation size={14} />
          <span className="text-sm font-medium">Route</span>
        </a>
      </div>
    </div>
  )
}
