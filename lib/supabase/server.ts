import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/database.types'

// Server-side Supabase client (App Router)
// Usage: const supabase = createServerClient()
// Server Components/RSC: cookies are read-only; provide no-op setters
export async function createServerClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createSupabaseServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // In RSC we cannot set/remove cookies; provide no-ops to satisfy API
      set(_name: string, _value: string, _options: CookieOptions) {},
      remove(_name: string, _options: CookieOptions) {},
    },
  })
}
