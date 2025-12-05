import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import ServicesClient from './ServicesClient'

// Admin client that bypasses RLS for reading data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

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
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('default_studio_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.default_studio_id) {
      studioId = profile.default_studio_id as string
    }
  }
  if (!studioId) {
    const { data: studio } = await supabaseAdmin
      .from('studios')
      .select('id')
      .eq('slug', '23-nailroom-bali')
      .maybeSingle()
    studioId = studio?.id ?? null
  }

  const { data: services, error } = await supabaseAdmin
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
