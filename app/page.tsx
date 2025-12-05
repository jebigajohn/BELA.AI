import Link from 'next/link'
import StudioInfo from '@/app/components/StudioInfo'
import PhotoGallery from '@/app/components/PhotoGallery'
import { getHeroPhotos } from '@/lib/supabase/storage'

// Fallback images wenn keine in Supabase
const fallbackImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800&q=80',
]

// Studio data - später aus der Datenbank
const studioData = {
  name: '23 Nailroom Bali',
  rating: 4.9,
  reviewCount: 127,
  address: 'Jl. Pantai Batu Bolong No.23, Canggu',
  googleMapsUrl: 'https://maps.google.com/?q=23+Nailroom+Bali+Canggu',
  openingHours: {
    isOpen: true,
    closesAt: '20:00',
  },
}

export default async function Home() {
  // Load hero photos from Supabase Storage
  const heroPhotos = await getHeroPhotos()
  const images = heroPhotos.length > 0 ? heroPhotos : fallbackImages

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Studio Info Section */}
        <StudioInfo
          name={studioData.name}
          rating={studioData.rating}
          reviewCount={studioData.reviewCount}
          address={studioData.address}
          googleMapsUrl={studioData.googleMapsUrl}
          openingHours={studioData.openingHours}
        />

        {/* Photo Gallery */}
        <div className="mt-8 relative">
          <PhotoGallery images={images} studioName={studioData.name} />
        </div>

        {/* Services Preview / CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 md:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Buche deinen Termin
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Wähle aus unseren professionellen Nail-Services und finde den
              perfekten Termin für dich.
            </p>
            <Link
              href="/demo/services"
              className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Services ansehen
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Premium Qualität
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Hochwertige Produkte und erstklassige Techniken für perfekte
              Ergebnisse.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-pink-600 dark:text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Flexible Zeiten
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Buche deinen Wunschtermin einfach online - wir passen uns deinem
              Schedule an.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-rose-600 dark:text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Entspannte Atmosphäre
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Genieße deine Auszeit in unserem gemütlichen Salon mitten im
              Paradies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
