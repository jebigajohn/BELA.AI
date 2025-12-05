'use client'

import { useState } from 'react'
import { Settings, Bell, Moon, Sun, Globe, Shield, User } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('de')

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Einstellungen
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Profil
              </h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Verwalte deine Profil-Einstellungen
            </p>
            <a
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Zum Profil
            </a>
          </section>

          {/* Notifications */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Benachrichtigungen
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  Push-Benachrichtigungen
                </p>
                <p className="text-sm text-neutral-500">
                  Erhalte Erinnerungen für Termine
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications
                    ? 'bg-purple-600'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              {darkMode ? (
                <Moon className="w-5 h-5 text-neutral-500" />
              ) : (
                <Sun className="w-5 h-5 text-neutral-500" />
              )}
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Erscheinungsbild
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  Dark Mode
                </p>
                <p className="text-sm text-neutral-500">
                  Dunkles Farbschema verwenden
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode
                    ? 'bg-purple-600'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Language */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Sprache
              </h2>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </section>

          {/* Privacy */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Datenschutz
              </h2>
            </div>
            <div className="space-y-3">
              <a
                href="/privacy"
                className="block text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Datenschutzerklärung
              </a>
              <a
                href="/terms"
                className="block text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Nutzungsbedingungen
              </a>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-900">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Gefahrenzone
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Diese Aktionen können nicht rückgängig gemacht werden.
            </p>
            <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              Account löschen
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}
