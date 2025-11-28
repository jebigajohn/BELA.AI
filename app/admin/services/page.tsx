import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import AdminServicesClient from './AdminServicesClient'

import Link from 'next/link'

export default async function AdminServicesPage() {
  async function deleteService(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user in server action', userError)
      redirect('/login?error=NoUser')
    }
    // Check admin role
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (memberError) {
      console.error('Error loading studio_members', memberError)
      redirect('/admin/services?error=NoMember')
    }
    if (member?.role !== 'admin') {
      console.error('Not admin', member)
      redirect('/admin/services?error=NotAdmin')
    }
    // Zuerst alle staff_services-Einträge für diesen Service löschen
    const { error: staffError } = await supabase
      .from('staff_services')
      .delete()
      .eq('service_id', id)
    if (staffError) {
      console.error('Delete staff_services error', staffError)
      redirect('/admin/services?error=DeleteStaffFailed')
    }
    // Dann Service löschen
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
    if (deleteError) {
      console.error('Delete error', deleteError)
      redirect('/admin/services?error=DeleteFailed')
    }
    redirect('/admin/services?success=deleted')
  }
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is admin (studio_members.profile_id === user.id)
  const { data: member } = await supabase
    .from('studio_members')
    .select('role')
    .eq('profile_id', user.id)
    .maybeSingle()
  if (member?.role !== 'admin') redirect('/demo/services')

  // Fetch all services for the admin's studio
  // Get studioId via studio_members
  const { data: studioMember } = await supabase
    .from('studio_members')
    .select('studio_id')
    .eq('profile_id', user.id)
    .maybeSingle()

  const studioId = studioMember?.studio_id
  if (!studioId) {
    return (
      <AdminServicesClient>
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Manage Services</h1>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              No studio assigned to your user. Please contact support.
              <br />
              studioId: {String(studioId)}
            </p>
          </CardContent>
        </Card>
      </AdminServicesClient>
    )
  }

  const { data: services, error } = await supabase
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('studio_id', studioId)
    .order('name', { ascending: true })

  return (
    <AdminServicesClient>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Manage Services</h1>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600">{error.message}</p>}
          <div className="mb-4 flex justify-end">
            <Link href="/admin/services/create">
              <Button>Add new service</Button>
            </Link>
          </div>
          <ul className="space-y-2">
            {(services ?? []).map((s) => (
              <li
                key={s.id}
                className="border rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-foreground/60">
                    {s.duration_min} min
                  </div>
                  <div className="text-indigo-600 font-semibold">
                    {(s.price_cents / 100).toFixed(2)} EUR
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/services/edit/${s.id}`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AdminServicesClient>
  )
}
