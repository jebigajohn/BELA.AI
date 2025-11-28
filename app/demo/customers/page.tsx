import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Resolve studio
  let studioId: string | null = null
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_studio_id')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.default_studio_id) {
    studioId = profile.default_studio_id as string
  } else {
    const { data: studio } = await supabase
      .from('studios')
      .select('id')
      .eq('slug', '23-nailroom-bali')
      .maybeSingle()
    studioId = studio?.id ?? null
  }

  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, full_name, email, phone')
    .eq('studio_id', studioId as string)
    .order('created_at', { ascending: false })

  return <CustomersClient customers={customers ?? []} error={error?.message} />
}
