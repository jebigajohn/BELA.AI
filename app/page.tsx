import Link from 'next/link'
import PageWrapper from '@/app/components/PageWrapper'

export default function Home() {
  return (
    <PageWrapper className="!p-0">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background with Gradient (placeholder until real image is added) */}
        <div className="absolute inset-0 z-0">
          {/* 
            To add a salon image:
            1. Add your image to /public/salon-hero.jpg
            2. Uncomment the Image component below
          */}
          {/* <Image
            src="/salon-hero.jpg"
            alt="23 Nailroom Bali - Luxury Nail Salon"
            fill
            className="object-cover"
            priority
          /> */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm">
                Jetzt Termine verfügbar
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Dein Nail Salon
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400">
                in Bali
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg leading-relaxed">
              Erlebe luxuriöse Maniküre & Pediküre im Herzen von Bali.
              Professionelle Nail Art, entspannte Atmosphäre und erstklassiger
              Service.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo/services"
                className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 font-semibold px-8 py-4 rounded-full hover:bg-neutral-100 transition-all hover:scale-105 shadow-lg"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Termin buchen
              </Link>
              <Link
                href="/demo/services"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                Services ansehen
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-white/60">Happy Clients</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-sm text-white/60">Google Rating</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5+</div>
                <div className="text-sm text-white/60">Jahre Erfahrung</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-neutral-900 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Warum 23 Nailroom?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-800 rounded-2xl p-8 text-center hover:bg-neutral-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-xl font-semibold text-white mb-3">
                Premium Qualität
              </h3>
              <p className="text-neutral-400">
                Hochwertige Produkte und erstklassige Techniken für perfekte
                Ergebnisse.
              </p>
            </div>

            <div className="bg-neutral-800 rounded-2xl p-8 text-center hover:bg-neutral-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-xl font-semibold text-white mb-3">
                Flexible Zeiten
              </h3>
              <p className="text-neutral-400">
                Buche deinen Wunschtermin einfach online - wir passen uns deinem
                Schedule an.
              </p>
            </div>

            <div className="bg-neutral-800 rounded-2xl p-8 text-center hover:bg-neutral-750 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-xl font-semibold text-white mb-3">
                Entspannte Atmosphäre
              </h3>
              <p className="text-neutral-400">
                Genieße deine Auszeit in unserem gemütlichen Salon mitten im
                Paradies.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Link
              href="/demo/services"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-10 py-4 rounded-full hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              Jetzt Termin buchen
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
      </div>
    </PageWrapper>
  )
}
