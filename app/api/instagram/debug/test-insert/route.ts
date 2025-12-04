import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// DEBUG ENDPOINT - nur für Tests, später entfernen!
// GET /api/instagram/debug/test-insert
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test-Nachricht einfügen
    const { data, error } = await supabase
      .from('instagram_messages')
      .insert({
        instagram_id: 'TEST_USER_123',
        direction: 'inbound',
        body: 'Dies ist eine Test-Nachricht! 🧪',
        raw: { test: true, timestamp: new Date().toISOString() },
      })
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test-Nachricht erfolgreich in Supabase gespeichert!',
      data,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}
