import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const redirectRes = NextResponse.redirect(new URL('/login', req.url))

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        redirectRes.cookies.set(name, value, options)
      },
      remove(name: string, options: CookieOptions) {
        redirectRes.cookies.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })

  await supabase.auth.signOut()
  // Fallback: aggressively clear any Supabase auth cookies (chunked names etc.)
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith('sb-')) {
      redirectRes.cookies.set(c.name, '', { path: '/', maxAge: 0 })
    }
  }
  return redirectRes
}
