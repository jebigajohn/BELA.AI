'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  Calendar,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ImageIcon,
} from 'lucide-react'

interface HeaderNavProps {
  isLoggedIn: boolean
  profile: {
    name: string
    email: string
    avatarUrl?: string
  } | null
  isAdmin?: boolean
}

export default function HeaderNav({
  isLoggedIn,
  profile,
  isAdmin,
}: HeaderNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/bellaai-logo.png"
              alt="BellaAI"
              width={120}
              height={32}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Right side - Profile or Auth buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn && profile ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* Chevron */}
                  <ChevronDown
                    size={18}
                    className={`text-neutral-600 dark:text-neutral-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Profile Info */}
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {profile.name}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {profile.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <User size={18} />
                        <span>Profil</span>
                      </Link>
                      <Link
                        href="/admin/appointments"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Calendar size={18} />
                        <span>Termine</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/demo/ai-dm"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Sparkles size={18} className="text-purple-500" />
                          <span>AI DMs</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          href="/admin/images"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <ImageIcon size={18} className="text-green-500" />
                          <span>Bilder</span>
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Settings size={18} />
                        <span>Einstellungen</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                      <form action="/logout" method="get">
                        <button
                          type="submit"
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Abmelden</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Anmelden
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                >
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
