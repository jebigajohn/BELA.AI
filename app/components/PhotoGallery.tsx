'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoGalleryProps {
  images: string[]
  studioName: string
}

export default function PhotoGallery({
  images,
  studioName,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAllModal, setShowAllModal] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
  }

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAllModal) return
      if (e.key === 'Escape') setShowAllModal(false)
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAllModal, currentIndex, images.length])

  if (images.length === 0) return null

  return (
    <>
      {/* Desktop Layout - Collage */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
          {/* Large image left */}
          <div
            className="col-span-2 row-span-2 relative group cursor-pointer"
            onClick={() => setShowAllModal(true)}
          >
            <Image
              src={images[0]}
              alt={`${studioName} - Bild 1`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>

          {/* Top right */}
          {images[1] && (
            <div
              className="col-span-1 row-span-1 relative group cursor-pointer"
              onClick={() => {
                setCurrentIndex(1)
                setShowAllModal(true)
              }}
            >
              <Image
                src={images[1]}
                alt={`${studioName} - Bild 2`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}

          {/* Top right 2 */}
          {images[2] && (
            <div
              className="col-span-1 row-span-1 relative group cursor-pointer"
              onClick={() => {
                setCurrentIndex(2)
                setShowAllModal(true)
              }}
            >
              <Image
                src={images[2]}
                alt={`${studioName} - Bild 3`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}

          {/* Bottom right */}
          {images[3] && (
            <div
              className="col-span-1 row-span-1 relative group cursor-pointer"
              onClick={() => {
                setCurrentIndex(3)
                setShowAllModal(true)
              }}
            >
              <Image
                src={images[3]}
                alt={`${studioName} - Bild 4`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}

          {/* Bottom right 2 with "Show all" button */}
          {images[4] ? (
            <div
              className="col-span-1 row-span-1 relative group cursor-pointer"
              onClick={() => {
                setCurrentIndex(4)
                setShowAllModal(true)
              }}
            >
              <Image
                src={images[4]}
                alt={`${studioName} - Bild 5`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-semibold">
                    +{images.length - 5} mehr
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-1 row-span-1 bg-neutral-200 dark:bg-neutral-800" />
          )}
        </div>

        {/* Show all button */}
        {images.length > 3 && (
          <button
            onClick={() => setShowAllModal(true)}
            className="absolute bottom-4 left-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Alle Bilder anzeigen
          </button>
        )}
      </div>

      {/* Mobile Layout - Swiper */}
      <div className="md:hidden relative">
        <div
          className="relative h-[300px] overflow-hidden rounded-xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentIndex]}
            alt={`${studioName} - Bild ${currentIndex + 1}`}
            fill
            className="object-cover"
          />

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setShowAllModal(false)}
        >
          <button
            onClick={() => setShowAllModal(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="relative w-full max-w-5xl h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`${studioName} - Bild ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            {/* Navigation */}
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight size={28} className="text-white" />
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
