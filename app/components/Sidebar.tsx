import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

import ThemeToggle from './ThemeToggle'
import { LogOut, MoreVertical } from 'lucide-react'

import SidebarMenu from './SidebarMenu'

export default async function Sidebar() {
  noStore()
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check admin role for current user
  let isAdmin = false
  if (user) {
    const { data: member } = await supabase
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .maybeSingle()
    isAdmin = member?.role === 'admin'
  }

  const profile = user
    ? {
        name: user.user_metadata?.name || 'Profil',
        email: user.email,
      }
    : null

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-neutral-900 text-neutral-100 p-4 z-40">
      <div>
        <Link href="/" className="block text-2xl font-bold mb-8 tracking-tight">
          23 Nailroom
        </Link>
        <nav className="flex flex-col gap-2">
          <Link
            href="/demo/services"
            className="hover:bg-neutral-800 rounded px-3 py-2 transition"
          >
            Services
          </Link>
          {user && (
            <>
              <Link
                href="/demo/customers"
                className="hover:bg-neutral-800 rounded px-3 py-2 transition"
              >
                Customers
              </Link>
              <Link
                href="/admin/staff"
                className="hover:bg-neutral-800 rounded px-3 py-2 transition"
              >
                Staff
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="flex flex-col gap-2">
        {user ? (
          <SidebarMenu isAdmin={isAdmin} profile={profile} />
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <Link
              href="/login"
              className="rounded border px-3 py-2 text-sm hover:bg-neutral-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded bg-foreground text-background px-3 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
