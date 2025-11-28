import React from 'react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-neutral-900 text-neutral-100 flex flex-col p-6 gap-4">
        <h1 className="text-2xl font-bold mb-6 tracking-tight">
          BELA.AI Admin
        </h1>
        <nav className="flex flex-col gap-2">
          <Link
            href="/admin/staff"
            className="hover:bg-neutral-800 rounded px-3 py-2 transition"
          >
            Mitarbeiter
          </Link>
          {/* Weitere Links für Admin-Bereich */}
        </nav>
      </aside>
      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
