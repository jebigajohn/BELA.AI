import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'

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

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Customers</h1>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600">{error.message}</p>}
          <ul className="space-y-2 mb-6">
            {(customers ?? []).map((c) => (
              <li key={c.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.full_name}</p>
                    <p className="text-sm text-foreground/60">
                      {c.email ?? '—'} · {c.phone ?? '—'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <form
            action="/api/customers/create"
            method="post"
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div>
              <Label>Name</Label>
              <Input name="full_name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input name="phone" />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Add customer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
