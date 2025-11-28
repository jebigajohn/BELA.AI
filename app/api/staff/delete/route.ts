import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const formData = await req.formData()
  const id = formData.get('id')?.toString()
  if (!id) {
    return NextResponse.json({ error: 'ID fehlt.' }, { status: 400 })
  }

  // Only allow admins (service_role or custom logic)
  // TODO: Replace with real admin check if available
  // ...existing code...

  const { error } = await supabase.from('staff').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // TODO: Notification logic (e.g., send email/SMS)
  return NextResponse.json({ success: true })
}
