import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import ServicesClient from './ServicesClient'

type Service = {
  id: string
  name: string
  price_cents: number
  duration_min: number
}

export default async function ServicesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Studio-Auswahl: Wenn eingeloggt, nutze default_studio_id, sonst fallback auf Slug
  let studioId: string | null = null
  if (user) {
    const { data: profile } = await getSupabaseAdmin()
      .from('profiles')
      .select('default_studio_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.default_studio_id) {
      studioId = profile.default_studio_id as string
    }
  }
  if (!studioId) {
    const { data: studio } = await getSupabaseAdmin()
      .from('studios')
      .select('id')
      .eq('slug', '23-nailroom-bali')
      .maybeSingle()
    studioId = studio?.id ?? null
  }

  const { data: services, error } = await getSupabaseAdmin()
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('studio_id', studioId as string)
    .order('name', { ascending: true })

  return (
    <ServicesClient
      services={(services ?? []) as Service[]}
      error={error?.message}
    />
  )
}
