import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

// Server Action außerhalb der Komponente
export async function updateService(formData: FormData) {
  'use server'
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  // Preis als Euro eingeben, aber in Cent speichern
  const price_eur = Number(formData.get('price_cents'))
  const price_cents = Math.round(price_eur * 100)
  const duration_min = Number(formData.get('duration_min'))
  await supabase
    .from('services')
    .update({
      name,
      price_cents,
      duration_min,
    })
    .eq('id', id)
  redirect('/admin/services')
}

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: member } = await supabase
    .from('studio_members')
    .select('role')
    .eq('profile_id', user.id)
    .maybeSingle()
  if (member?.role !== 'admin') redirect('/admin/services')

  // Get studioId via studio_members
  const { data: studioMember } = await supabase
    .from('studio_members')
    .select('studio_id')
    .eq('profile_id', user.id)
    .maybeSingle()
  const studioId = studioMember?.studio_id
  if (!studioId) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Edit Service</h1>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              No studio assigned to your user. Please contact support.
              <br />
              studioId: {String(studioId)}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch service
  const { data: service, error } = await supabase
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('id', id)
    .eq('studio_id', studioId)
    .maybeSingle()
  if (!service) redirect('/admin/services')

  return (
    <main className="flex-1 min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8 overflow-auto relative">
      <a
        href="/admin/services"
        className="absolute left-0 top-0 mt-2 ml-2 rounded-full bg-background border shadow p-2 hover:bg-foreground/10 transition-colors flex items-center justify-center"
        title="Back to Manage Services"
        aria-label="Back"
        style={{ width: 40, height: 40 }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 17l-5-5 5-5" />
        </svg>
      </a>
      <div className="max-w-xl mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Edit Service</h1>
          </CardHeader>
          <CardContent>
            <form action={updateService} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="name"
                  defaultValue={service.name}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Price (EUR)</label>
                <input
                  name="price_cents"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={(service.price_cents / 100).toFixed(2)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Duration (min)</label>
                <input
                  name="duration_min"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={service.duration_min}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <Button type="submit">Update Service</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
