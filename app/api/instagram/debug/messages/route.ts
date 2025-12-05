import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// GET - Debug: Zeige alle Messages in der DB
export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin
    const { data: membership } = await supabaseAdmin
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Hole alle Messages
    const { data: messages, error } = await supabaseAdmin
      .from('instagram_messages')
      .select('id, instagram_id, direction, body, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Gruppiere nach instagram_id für Übersicht
    const summary: Record<
      string,
      { count: number; lastMessage: string; lastAt: string }
    > = {}

    for (const msg of messages || []) {
      if (!summary[msg.instagram_id]) {
        summary[msg.instagram_id] = {
          count: 1,
          lastMessage: msg.body || '',
          lastAt: msg.created_at,
        }
      } else {
        summary[msg.instagram_id].count++
      }
    }

    return NextResponse.json({
      total: messages?.length || 0,
      summary,
      messages,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE - Lösche alle Messages (Reset)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin
    const { data: membership } = await supabaseAdmin
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const instagramId = searchParams.get('instagram_id')

    if (instagramId) {
      // Lösche nur Messages für diese instagram_id
      const { error } = await supabaseAdmin
        .from('instagram_messages')
        .delete()
        .eq('instagram_id', instagramId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Alle Messages für ${instagramId} gelöscht`,
      })
    } else {
      // Lösche ALLE Messages
      const { error } = await supabaseAdmin
        .from('instagram_messages')
        .delete()
        .neq('id', 0) // Trick um alle zu löschen

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Alle Messages gelöscht - Webhook wird neue Messages sammeln',
      })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
