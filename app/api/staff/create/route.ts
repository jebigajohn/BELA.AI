import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const formData = await req.formData()
  const display_name = formData.get('name')?.toString().trim()
  const role = formData.get('role')?.toString()
  const email = formData.get('email')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()
  const image_url = formData.get('image_url')?.toString()

  // Simple validation
  if (!display_name || !role || (!email && !phone)) {
    return NextResponse.json(
      { error: 'Name, Rolle und E-Mail oder Handy sind Pflicht.' },
      { status: 400 }
    )
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Ungültige E-Mail.' }, { status: 400 })
  }
  if (phone && !/^\+?[0-9\- ]{7,}$/.test(phone)) {
    return NextResponse.json(
      { error: 'Ungültige Telefonnummer.' },
      { status: 400 }
    )
  }

  // Only allow admins (service_role or custom logic)
  // TODO: Replace with real admin check if available
  // ...existing code...

  // Note: The staff table requires id and studio_id.
  // This route needs proper implementation with those required fields.
  const { data, error } = await (supabase.from as any)('staff')
    .insert({
      display_name,
      // TODO: Add required fields: id, studio_id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // TODO: Notification logic (e.g., send email/SMS)

  return NextResponse.json({ staff: data })
}
