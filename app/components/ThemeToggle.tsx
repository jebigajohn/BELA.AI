'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <path
        d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChristmasIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
      {/* Christmas Tree */}
      <path
        d="M12 2L8 8h2l-3 6h2l-4 8h14l-4-8h2l-3-6h2L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Star */}
      <path
        d="M12 2l0.5 1.5L14 3l-1 1 0.5 1.5L12 5l-1.5 0.5L11 4l-1-1 1.5 0.5L12 2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function ThemeToggle({
  className = '',
}: {
  className?: string
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Cycle through: light -> dark -> christmas -> light
  const getNextTheme = () => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'christmas'
    return 'light'
  }

  const getIcon = () => {
    if (theme === 'dark') return <MoonIcon className="h-5 w-5" />
    if (theme === 'christmas')
      return <ChristmasIcon className="h-5 w-5 text-green-600" />
    return <SunIcon className="h-5 w-5" />
  }

  const getLabel = () => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'christmas'
    return 'light'
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(getNextTheme())}
      className={`rounded-full w-10 h-10 border bg-background text-foreground hover:bg-foreground/5 transition-colors inline-flex items-center justify-center shadow ${
        theme === 'christmas'
          ? 'border-red-500 bg-green-50 dark:bg-green-950'
          : ''
      } ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${getLabel()} mode`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
