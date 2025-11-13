import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )

    const form = await req.formData()
    const full_name = form.get('full_name')?.toString()
    const email = form.get('email')?.toString() || null
    const phone = form.get('phone')?.toString() || null
    if (!full_name)
      return NextResponse.json(
        { success: false, error: 'Missing name' },
        { status: 400 }
      )

    // studio context
    let studio_id: string | null = null
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_studio_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.default_studio_id) {
      studio_id = profile.default_studio_id as string
    } else {
      const { data: studio } = await supabase
        .from('studios')
        .select('id')
        .eq('slug', '23-nailroom-bali')
        .maybeSingle()
      studio_id = studio?.id ?? null
    }

    if (!studio_id)
      return NextResponse.json(
        { success: false, error: 'No studio context' },
        { status: 400 }
      )

    // insert
    const id =
      (globalThis.crypto as any)?.randomUUID?.() ||
      (await import('crypto')).randomUUID()
    const { data, error } = await supabase
      .from('customers')
      .insert({ id, studio_id, full_name, email, phone })
      .select('id')
      .single()

    if (error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )

    return NextResponse.json({ success: true, id: data.id })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
