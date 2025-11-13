import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormClient from './FormClient'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'

type Service = {
  id: string
  name: string
  price_cents: number
  duration_min: number
}

function formatCents(cents?: number) {
  const n = (cents ?? 0) / 100
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export default async function ServicesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Resolve studio context: prefer user's default_studio_id, fallback to seeded slug
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

  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('studio_id', studioId as string)
    .order('name', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Services</h1>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-600">
              Fehler beim Laden der Services
              {error.message ? `: ${error.message}` : ''}
            </p>
          )}
          <ul className="grid grid-cols-1 gap-3">
            {((services ?? []) as Service[]).map((s: Service) => (
              <li key={s.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-foreground/60">
                      {s.duration_min} min
                    </p>
                  </div>
                  <div className="text-indigo-600 font-semibold">
                    {formatCents(s.price_cents)} EUR
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <FormClient services={services ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
