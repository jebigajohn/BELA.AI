import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'
import HeaderNav from './HeaderNav'

export default async function Header() {
  noStore()
  const supabase = await createServerClient()
  let user = null
  let isAdmin = false

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    // Check if user is admin - use admin client to bypass RLS
    if (user) {
      const { data: membership, error: membershipError } = await getSupabaseAdmin()
        .from('studio_members')
        .select('role')
        .eq('profile_id', user.id)
        .single()

      if (membershipError) {
        console.warn('studio_members query error:', membershipError.message)
      }

      console.log('Header.server - User ID:', user.id)
      console.log('Header.server - Membership:', membership)
      console.log('Header.server - isAdmin:', membership?.role === 'admin')

      isAdmin = membership?.role === 'admin'
    }
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

  return <HeaderNav isLoggedIn={!!user} profile={profile} isAdmin={isAdmin} />
}
