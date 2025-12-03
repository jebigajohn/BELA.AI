import { NextRequest, NextResponse } from 'next/server'
import { verifyHubSignature, sendInstagramReply } from '@/lib/instagram/client'
import { createServerClient } from '@/lib/supabase/server'
import { generateDMResponse } from '@/lib/ai/dm-generator'

// Removed 'edge' runtime - Supabase server client is not Edge-compatible

// GET for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return new Response(challenge || 'ok', { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

// POST for incoming events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Minimal validation
    if (!body || !body.entry)
      return NextResponse.json({ ok: false }, { status: 400 })

    // For each entry/changes, look for messages
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value
        if (!value) continue

        // Example path: messaging -> messages
        const messages = value.messaging || value.messages || []

        for (const msg of messages) {
          const fromId = msg.from || msg.sender?.id || msg.sender_id
          const text = msg.message?.text || msg.text || msg.body

          // Store incoming message in Supabase
          try {
            const supabase = await createServerClient()
            await supabase.from('instagram_messages').insert({
              instagram_id: fromId,
              direction: 'inbound',
              body: text,
              raw: msg,
            })
          } catch (e) {
            console.warn('Supabase insert failed', e)
          }

          // Generate reply via AI
          try {
            const ai = await generateDMResponse(text)
            const replyText =
              (ai as any).answer || (ai as any).response || JSON.stringify(ai)
            // send reply
            await sendInstagramReply(fromId, replyText)

            // store outbound
            try {
              const supabase = await createServerClient()
              await supabase.from('instagram_messages').insert({
                instagram_id: fromId,
                direction: 'outbound',
                body: replyText,
                raw: ai,
              })
            } catch (e) {
              console.warn('Supabase insert failed', e)
            }
          } catch (e) {
            console.error('AI reply/send failed', e)
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handling error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
