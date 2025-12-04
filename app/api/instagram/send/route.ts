import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendInstagramReply } from '@/lib/instagram/client'
import { generateDMResponse } from '@/lib/ai/dm-generator'

interface SendMessageBody {
  instagram_id: string
  message: string
  use_ai?: boolean // Wenn true, generiert AI die Antwort
}

// POST /api/instagram/send - Nachricht an Instagram User senden
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageBody = await request.json()

    if (!body.instagram_id || !body.message) {
      return NextResponse.json(
        { error: 'instagram_id and message are required' },
        { status: 400 }
      )
    }

    let messageToSend = body.message

    // Optional: AI generiert die Antwort
    if (body.use_ai) {
      try {
        const ai = await generateDMResponse(body.message)
        messageToSend =
          (ai as any).answer || (ai as any).response || JSON.stringify(ai)
      } catch (err) {
        console.error('AI generation failed:', err)
        return NextResponse.json(
          { error: 'AI generation failed' },
          { status: 500 }
        )
      }
    }

    // Sende Nachricht an Instagram
    try {
      await sendInstagramReply(body.instagram_id, messageToSend)
    } catch (err) {
      console.error('Failed to send Instagram message:', err)
      return NextResponse.json(
        { error: 'Failed to send message to Instagram', details: String(err) },
        { status: 500 }
      )
    }

    // Speichere in Supabase
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('instagram_messages')
      .insert({
        instagram_id: body.instagram_id,
        direction: 'outbound',
        body: messageToSend,
        raw: { manual: true, use_ai: body.use_ai },
      })
      .select()
      .single()

    if (error) {
      console.warn('Failed to save message to Supabase:', error)
    }

    return NextResponse.json({
      success: true,
      message: messageToSend,
      saved: data,
    })
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
