import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { sendInstagramReply } from '@/lib/instagram/client'
import { generateDMResponse, type ChatMessage } from '@/lib/ai/dm-generator'

// Lazy-init admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface SendMessageBody {
  instagram_id: string
  message: string
  use_ai?: boolean // Wenn true, generiert AI die Antwort
}

// POST /api/instagram/send - Nachricht an Instagram User senden
export async function POST(request: NextRequest) {
  console.log('📤 Send API called')

  try {
    // Parse body first
    const body: SendMessageBody = await request.json()
    console.log('📝 Body:', JSON.stringify(body))

    if (!body.instagram_id || !body.message) {
      return NextResponse.json(
        { error: 'instagram_id and message are required' },
        { status: 400 }
      )
    }

    // Auth check
    let user = null
    try {
      const supabase = await createServerClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (authError) {
      console.error('Auth error:', authError)
    }

    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User:', user.id)

    // Check admin status
    const supabaseAdmin = getSupabaseAdmin()
    const { data: membership, error: membershipError } = await getSupabaseAdmin()
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membershipError) {
      console.error('Membership error:', membershipError)
    }

    if (membership?.role !== 'admin') {
      console.log('❌ Not admin:', membership)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('✅ Admin confirmed')

    let messageToSend = body.message

    // Optional: AI generiert die Antwort
    if (body.use_ai) {
      try {
        console.log('🤖 Generating AI response...')

        // Lade Chat-Historie für Kontext
        const { data: messages } = await getSupabaseAdmin()
          .from('instagram_messages')
          .select('direction, body')
          .eq('instagram_id', body.instagram_id)
          .order('created_at', { ascending: true })
          .limit(20) // Letzte 20 Nachrichten für Kontext

        const chatHistory: ChatMessage[] = (messages || []).map((msg) => ({
          direction: msg.direction as 'inbound' | 'outbound',
          body: msg.body,
        }))

        console.log(`📚 Chat history: ${chatHistory.length} messages`)

        const ai = await generateDMResponse(
          body.message,
          undefined,
          chatHistory
        )
        messageToSend =
          (ai as any).answer || (ai as any).response || JSON.stringify(ai)
        console.log('🤖 AI response:', messageToSend)
      } catch (err) {
        console.error('AI generation failed:', err)
        // Fallback: Sende die originale Nachricht wenn AI fehlschlägt
        console.log('Falling back to original message')
        messageToSend = body.message
      }
    }

    // Instagram hat ein 1000-Zeichen-Limit - kürze wenn nötig
    if (messageToSend.length > 950) {
      console.warn(
        `⚠️ Message too long (${messageToSend.length} chars), truncating...`
      )
      messageToSend = messageToSend.substring(0, 947) + '...'
    }

    // Sende Nachricht an Instagram
    try {
      console.log('📤 Sending to Instagram:', body.instagram_id)
      await sendInstagramReply(body.instagram_id, messageToSend)
      console.log('✅ Sent to Instagram user:', body.instagram_id)
    } catch (err) {
      console.error('Failed to send Instagram message:', err)
      return NextResponse.json(
        { error: 'Failed to send message to Instagram', details: String(err) },
        { status: 500 }
      )
    }

    // Speichere in Supabase mit Admin-Client (umgeht RLS)
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('instagram_messages')
        .insert({
          instagram_id: body.instagram_id,
          direction: 'outbound',
          body: messageToSend,
          raw: { manual: true, use_ai: body.use_ai, sent_by: user.id },
        })
        .select()
        .single()

      if (error) {
        console.warn('Failed to save message to Supabase:', error)
      } else {
        console.log('✅ Message saved for user:', body.instagram_id)
      }

      return NextResponse.json({
        success: true,
        message: messageToSend,
        saved: data,
      })
    } catch (dbErr) {
      console.error('DB error:', dbErr)
      // Nachricht wurde gesendet, nur DB-Speicherung fehlgeschlagen
      return NextResponse.json({
        success: true,
        message: messageToSend,
        saved: null,
        warning: 'Message sent but not saved to database',
      })
    }
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json(
      { error: 'Failed to send message', details: String(err) },
      { status: 500 }
    )
  }
}
