import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

// ...existing code...

export default async function CreateServicePage() {
  async function createService(formData: FormData) {
    'use server'
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

    const name = formData.get('name') as string
    // Preis als Euro eingeben, aber in Cent speichern
    const price_eur = Number(formData.get('price_cents'))
    const price_cents = Math.round(price_eur * 100)
    const duration_min = Number(formData.get('duration_min'))
    const studioId = formData.get('studio_id') as string
    // currency ist Pflichtfeld in Tabelle
    const currency = 'EUR'
    if (!name || !studioId) {
      redirect('/admin/services/create?error=Missing+name+or+studioId')
    }
    // id ist Pflichtfeld (uuid)
    const id = crypto.randomUUID()
    const { error } = await supabase.from('services').insert([
      {
        name,
        price_cents,
        duration_min,
        id,
        studio_id: studioId,
        currency,
      },
    ])
    if (error) {
      redirect(
        `/admin/services/create?error=${encodeURIComponent(error.message)}`
      )
    }
    redirect('/admin/services')
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
            <h1 className="text-2xl font-bold">Add New Service</h1>
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

  // Fehler aus Query-Param anzeigen
  let errorMsg = ''
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    errorMsg = params.get('error') || ''
  }
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Add New Service</h1>
        </CardHeader>
        <CardContent>
          {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
          <form action={createService} className="space-y-4">
            <input type="hidden" name="studio_id" value={studioId} />
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input
                name="name"
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
                step="1"
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
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <Button type="submit">Create Service</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
