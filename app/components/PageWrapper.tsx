'use client'
import { useSidebar } from './SidebarContext'

export default function PageWrapper({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder - hidden on mobile */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        aria-hidden="true"
      />
      <main
        className={`flex-1 bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8 overflow-auto ${className}`}
      >
        {children}
      </main>
    </div>
  )
}
