import { createServerClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import HeaderNav from './HeaderNav'

export default async function Header() {
  noStore()
  const supabase = await createServerClient()
  let user = null

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    console.warn('Supabase auth.getUser failed, ignoring', error)
  }

  const profile = user
    ? {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email ?? '',
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : null

  return <HeaderNav isLoggedIn={!!user} profile={profile} />
}
