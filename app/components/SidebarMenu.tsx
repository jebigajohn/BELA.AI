'use client'
import Link from 'next/link'
import { MoreVertical, User } from 'lucide-react'

export default function SidebarMenu({
  isAdmin,
  profile,
}: {
  isAdmin: boolean
  profile: { name: string; email: string } | null
}) {
  return (
    <div className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-neutral-800 relative">
      <div className="flex-1 pl-2">
        <div className="font-semibold">{profile?.name}</div>
        <div className="text-xs text-neutral-400 truncate">
          {profile?.email}
        </div>
      </div>

      <Link
        href="/profile"
        title="Edit Profile"
        className="p-1 rounded-full hover:bg-neutral-700 cursor-pointer flex items-center justify-center"
      >
        <User size={20} />
      </Link>

      {/* 3-Dot Dropdown Menu */}
      <details className="relative group">
        <summary className="list-none p-1 rounded-full hover:bg-neutral-700 cursor-pointer flex items-center justify-center">
          <MoreVertical size={20} />
        </summary>
        <div className="absolute left-0 bottom-10 min-w-40 bg-neutral-900 border border-neutral-700 rounded shadow-lg z-50 flex flex-col">
          {isAdmin && (
            <>
              <Link
                href="/admin/services"
                className="px-4 py-2 hover:bg-neutral-800 text-left w-full text-sm"
                onClick={(e) => {
                  let el = e.target as HTMLElement | null
                  while (el && el.tagName !== 'DETAILS') {
                    el = el.parentElement
                  }
                  if (el && el.tagName === 'DETAILS') {
                    ;(el as HTMLDetailsElement).open = false
                  }
                }}
              >
                Manage Services
              </Link>
              <Link
                href="/admin/appointments"
                className="px-4 py-2 hover:bg-neutral-800 text-left w-full text-sm"
                onClick={(e) => {
                  let el = e.target as HTMLElement | null
                  while (el && el.tagName !== 'DETAILS') {
                    el = el.parentElement
                  }
                  if (el && el.tagName === 'DETAILS') {
                    ;(el as HTMLDetailsElement).open = false
                  }
                }}
              >
                Appointments
              </Link>
            </>
          )}
          <form action="/logout" method="get" className="w-full">
            <button
              type="submit"
              className="px-4 py-2 w-full text-left hover:bg-neutral-800 text-sm text-red-400"
            >
              Logout
            </button>
          </form>
        </div>
      </details>
    </div>
  )
}
