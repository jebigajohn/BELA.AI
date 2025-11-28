import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'
import PageWrapper from '@/app/components/PageWrapper'

type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  requested:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  checked_in:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateForInput(date: Date) {
  return date.toISOString().split('T')[0]
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; staff_id?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: member } = await supabase
    .from('studio_members')
    .select('role, studio_id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (member?.role !== 'admin') redirect('/demo/services')

  const studioId = member.studio_id

  // Fetch staff for filter dropdown
  const { data: staffList } = await supabase
    .from('staff')
    .select('id, display_name')
    .eq('studio_id', studioId)
    .order('display_name', { ascending: true })

  // Build query with filters
  let query = supabase
    .from('appointments')
    .select(
      `
      id,
      starts_at,
      ends_at,
      status,
      price_cents,
      currency,
      notes,
      customer:customers!appointments_customer_fk(id, full_name, email),
      service:services!appointments_service_fk(id, name),
      staff:staff!appointments_staff_fk(id, display_name)
    `
    )
    .eq('studio_id', studioId)
    .order('starts_at', { ascending: false })

  // Apply date filter
  if (params.date) {
    const startOfDay = `${params.date}T00:00:00`
    const endOfDay = `${params.date}T23:59:59`
    query = query.gte('starts_at', startOfDay).lte('starts_at', endOfDay)
  }

  // Apply staff filter
  if (params.staff_id) {
    query = query.eq('staff_id', params.staff_id)
  }

  // Apply status filter
  if (params.status) {
    query = query.eq('status', params.status as AppointmentStatus)
  }

  const { data: appointments, error } = await query

  // Server action to update status
  async function updateStatus(formData: FormData) {
    'use server'
    const appointmentId = formData.get('appointmentId') as string
    const newStatus = formData.get('status') as
      | 'requested'
      | 'confirmed'
      | 'checked_in'
      | 'completed'
      | 'cancelled'
      | 'no_show'
    const supabase = await createServerClient()

    await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)

    // Preserve current filters in redirect
    const currentParams = new URLSearchParams()
    const date = formData.get('currentDate') as string
    const staffId = formData.get('currentStaffId') as string
    const status = formData.get('currentStatus') as string
    if (date) currentParams.set('date', date)
    if (staffId) currentParams.set('staff_id', staffId)
    if (status) currentParams.set('status', status)

    const queryString = currentParams.toString()
    redirect(`/admin/appointments${queryString ? `?${queryString}` : ''}`)
  }

  const today = formatDateForInput(new Date())

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-bold">Appointments</h1>
              <Link href="/admin/appointments/create">
                <Button>+ New Appointment</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form method="get" className="mb-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={params.date ?? ''}
                  className="border rounded px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Staff</label>
                <select
                  name="staff_id"
                  defaultValue={params.staff_id ?? ''}
                  className="border rounded px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                >
                  <option value="">All Staff</option>
                  {(staffList ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={params.status ?? ''}
                  className="border rounded px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                >
                  <option value="">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Filter</Button>
                <Link href="/admin/appointments">
                  <Button variant="outline" type="button">
                    Reset
                  </Button>
                </Link>
              </div>
            </form>

            {/* Quick date shortcuts */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <Link href={`/admin/appointments?date=${today}`}>
                <Button variant="outline" size="sm">
                  Today
                </Button>
              </Link>
              <Link
                href={`/admin/appointments?date=${formatDateForInput(
                  new Date(Date.now() + 86400000)
                )}`}
              >
                <Button variant="outline" size="sm">
                  Tomorrow
                </Button>
              </Link>
              <Link
                href={`/admin/appointments?date=${formatDateForInput(
                  new Date(Date.now() - 86400000)
                )}`}
              >
                <Button variant="outline" size="sm">
                  Yesterday
                </Button>
              </Link>
            </div>

            {error && <p className="text-red-600 mb-4">{error.message}</p>}

            {/* Appointments list */}
            {appointments && appointments.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">
                No appointments found for the selected filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-3 px-2">Date & Time</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Service</th>
                      <th className="py-3 px-2">Staff</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(appointments ?? []).map((appt) => (
                      <tr
                        key={appt.id}
                        className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      >
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {formatDateTime(appt.starts_at)}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {(appt.customer as any)?.full_name ?? '—'}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {(appt.customer as any)?.email ?? ''}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {(appt.service as any)?.name ?? '—'}
                        </td>
                        <td className="py-3 px-2">
                          {(appt.staff as any)?.display_name ?? '—'}
                        </td>
                        <td className="py-3 px-2">
                          {(appt.price_cents / 100).toFixed(2)} {appt.currency}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[appt.status as AppointmentStatus]
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <form action={updateStatus} className="flex gap-1">
                            <input
                              type="hidden"
                              name="appointmentId"
                              value={appt.id}
                            />
                            <input
                              type="hidden"
                              name="currentDate"
                              value={params.date ?? ''}
                            />
                            <input
                              type="hidden"
                              name="currentStaffId"
                              value={params.staff_id ?? ''}
                            />
                            <input
                              type="hidden"
                              name="currentStatus"
                              value={params.status ?? ''}
                            />
                            <select
                              name="status"
                              defaultValue={appt.status}
                              className="text-xs border rounded px-2 py-1 dark:bg-neutral-800 dark:border-neutral-700"
                            >
                              <option value="requested">Requested</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="checked_in">Checked In</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no_show">No Show</option>
                            </select>
                            <Button type="submit" size="sm" variant="outline">
                              Update
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
