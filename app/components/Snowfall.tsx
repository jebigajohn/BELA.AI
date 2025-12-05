'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  left: number
  animationDuration: number
  animationDelay: number
  size: number
}

export default function Snowfall() {
  const { theme } = useTheme()
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (theme === 'christmas') {
      // Generate snowflakes
      const flakes: Snowflake[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        size: 0.8 + Math.random() * 0.8,
      }))
      setSnowflakes(flakes)
    } else {
      setSnowflakes([])
    }
  }, [theme])

  if (!mounted || theme !== 'christmas' || snowflakes.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.size}rem`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  )
}
