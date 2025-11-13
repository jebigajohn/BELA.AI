import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const service_id = form.get('service_id')?.toString()
    const starts_at_input = form.get('starts_at')?.toString()
    const customer_name = form.get('customer_name')?.toString() || null
    const customer_email = form.get('customer_email')?.toString() || null

    if (!service_id || !starts_at_input) {
      return NextResponse.json(
        { success: false, error: 'Missing fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Auth user
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }
    const user = authData.user

    // Studio context
    let studio_id: string | null = null
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('default_studio_id')
      .eq('id', user.id)
      .single()

    if (!profErr && profile?.default_studio_id) {
      studio_id = profile.default_studio_id as string
    } else {
      const { data: studio, error: studioErr } = await supabase
        .from('studios')
        .select('id')
        .eq('slug', '23-nailroom-bali')
        .single()
      if (!studioErr && studio?.id) {
        studio_id = studio.id as string
      }
    }

    if (!studio_id) {
      return NextResponse.json(
        { success: false, error: 'No studio context' },
        { status: 400 }
      )
    }

    // Check membership (RLS will still enforce)
    const { data: member, error: memErr } = await supabase
      .from('studio_members')
      .select('role, is_active')
      .match({ studio_id, profile_id: user.id })
      .single()

    if (memErr || !member?.is_active) {
      return NextResponse.json(
        { success: false, error: 'No studio access' },
        { status: 403 }
      )
    }

    // Load service (ensure it belongs to studio)
    const { data: service, error: svcErr } = await supabase
      .from('services')
      .select('id, duration_min, price_cents, currency')
      .match({ studio_id, id: service_id })
      .single()

    if (svcErr || !service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Ensure a customer exists (use auth user id)
    let customer_id: string | null = null
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .match({ studio_id, id: user.id })
      .maybeSingle()

    if (existingCustomer?.id) {
      customer_id = existingCustomer.id
    } else {
      const insertCustomer: any = {
        id: user.id,
        studio_id,
        full_name:
          customer_name ||
          (user.user_metadata?.full_name as string) ||
          'New Customer',
        email: customer_email || (user.email as string) || null,
      }
      const { data: custIns, error: custErr } = await supabase
        .from('customers')
        .insert(insertCustomer)
        .select('id')
        .single()

      if (custErr || !custIns) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot create customer: ' + (custErr?.message || 'unknown'),
          },
          { status: 403 }
        )
      }
      customer_id = custIns.id
    }

    // Pick a bookable staff
    const { data: staff, error: staffErr } = await supabase
      .from('staff')
      .select('id')
      .eq('studio_id', studio_id)
      .eq('is_bookable', true)
      .limit(1)
      .single()

    if (staffErr || !staff?.id) {
      return NextResponse.json(
        { success: false, error: 'No bookable staff found' },
        { status: 400 }
      )
    }

    // Compute times
    const starts_at_local = new Date(starts_at_input)
    if (isNaN(starts_at_local.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid datetime' },
        { status: 400 }
      )
    }
    const ends_at_local = new Date(
      starts_at_local.getTime() + service.duration_min * 60000
    )

    // Create appointment
    const id = randomUUID()

    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        id,
        studio_id,
        customer_id,
        staff_id: staff.id,
        service_id: service.id,
        starts_at: starts_at_local.toISOString(),
        ends_at: ends_at_local.toISOString(),
        status: 'requested',
        price_cents: service.price_cents,
        currency: service.currency || 'EUR',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (apptErr || !appt) {
      return NextResponse.json(
        { success: false, error: apptErr?.message || 'Insert failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, appointment_id: appt.id })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
