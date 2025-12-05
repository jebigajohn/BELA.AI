import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from './components/Header.server'
import ThemeToggle from './components/ThemeToggle'
import Snowfall from './components/Snowfall'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BellaAI - Termin buchen',
  description: 'Buche deinen Termin bei deinem Lieblings-Nagelstudio',
}

// Make the root layout dynamic so auth header updates immediately after login/logout
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="min-h-screen">
            <Snowfall />
            <Header />
            <main className="pt-16 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
              {children}
              {/* Floating ThemeToggle Button */}
              <div className="fixed bottom-6 right-6 z-50">
                <ThemeToggle />
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
