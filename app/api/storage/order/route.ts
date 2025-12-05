import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Admin-Check Helper
async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    // Use admin client to bypass RLS
    const { data: membership } = await getSupabaseAdmin()
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    return membership?.role === 'admin'
  } catch {
    return false
  }
}

// POST - Speichere Reihenfolge
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { bucket, order } = body

    if (!bucket || !Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Bucket und Order-Array erforderlich' },
        { status: 400 }
      )
    }

    // Speichere die Reihenfolge in der Datenbank (upsert)
    const { error: upsertError } = await getSupabaseAdmin()
      .from('storage_order')
      .upsert(
        {
          bucket,
          file_order: order,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'bucket' }
      )

    if (upsertError) {
      console.error('Order save error:', upsertError)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Reihenfolge' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order save error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// GET - Hole Reihenfolge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')

    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket erforderlich' },
        { status: 400 }
      )
    }

    // Hole die Order aus der Datenbank
    const { data, error } = await getSupabaseAdmin()
      .from('storage_order')
      .select('file_order')
      .eq('bucket', bucket)
      .single()

    if (error || !data) {
      // Keine Order vorhanden - gib leeres Array zurück
      return NextResponse.json({ order: [] })
    }

    return NextResponse.json({ order: data.file_order || [] })
  } catch (error) {
    console.error('Order get error:', error)
    return NextResponse.json({ order: [] })
  }
}
