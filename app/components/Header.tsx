import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import ThemeToggle from '../components/ThemeToggle'

// Ensure this header is never statically cached; it must reflect auth state
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Header() {
  // Ensure fresh auth state on each render
  noStore()
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          23 Nailroom
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                href="/demo/services"
                className="hover:opacity-80 transition-opacity"
              >
                Services
              </Link>
              <Link
                href="/demo/customers"
                className="hover:opacity-80 transition-opacity"
              >
                Customers
              </Link>
              <ThemeToggle />
              <Link
                href="/logout"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-foreground/5 transition-colors"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-foreground/5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu */}
        <details className="md:hidden relative">
          <summary className="list-none rounded-md border px-3 py-1.5 text-sm hover:bg-foreground/5 transition-colors cursor-pointer">
            <span className="sr-only">Open menu</span>
            {/* Burger icon */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-md p-2 flex flex-col gap-1 z-50">
            {user ? (
              <>
                <Link
                  href="/demo/services"
                  className="px-3 py-2 rounded hover:bg-foreground/5"
                >
                  Services
                </Link>
                <Link
                  href="/demo/customers"
                  className="px-3 py-2 rounded hover:bg-foreground/5"
                >
                  Customers
                </Link>
                <div className="px-2 py-1.5">
                  <ThemeToggle />
                </div>
                <Link
                  href="/logout"
                  className="px-3 py-2 rounded border hover:bg-foreground/5"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <div className="px-2 py-1.5">
                  <ThemeToggle />
                </div>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded border hover:bg-foreground/5"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 rounded bg-foreground text-background hover:opacity-90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  )
}
