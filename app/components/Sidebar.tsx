import { createServerClient } from '@/lib/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import SidebarClient from './SidebarClient'

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
        email: user.email ?? '',
      }
    : null

  return (
    <SidebarClient isAdmin={isAdmin} isLoggedIn={!!user} profile={profile} />
  )
}
