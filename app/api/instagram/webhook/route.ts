import { NextRequest, NextResponse } from 'next/server'
import { verifyHubSignature, sendInstagramReply } from '@/lib/instagram/client'
import { createServerClient } from '@/lib/supabase/server'
import { generateDMResponse } from '@/lib/ai/dm-generator'
import type { Json } from '@/database.types'

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
    // Hole den Raw-Body für Signaturprüfung
    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256') || ''

    console.log('📩 Webhook received!')
    console.log('Body length:', rawBody.length)
    console.log('Has signature:', !!signature)

    // Verifiziere die Signatur von Meta (temporarily log but don't reject)
    const isValidSignature = verifyHubSignature(rawBody, signature)
    if (!isValidSignature) {
      console.warn(
        '⚠️ Invalid webhook signature - but processing anyway for debugging'
      )
      // In production, uncomment this:
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    console.log('📦 Parsed body:', JSON.stringify(body, null, 2))

    // Minimal validation
    if (!body || !body.entry) {
      console.log('❌ No entry in body')
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // For each entry, look for messages
    // Instagram uses different structures depending on webhook type:
    // - "changes" array with "field": "messages" and "value" containing message data
    // - "messaging" array directly on entry
    for (const entry of body.entry || []) {
      console.log('📬 Processing entry:', JSON.stringify(entry, null, 2))

      // Handle "changes" structure (Instagram API)
      for (const change of entry.changes || []) {
        console.log('🔄 Processing change:', change.field)
        const value = change.value
        if (!value) continue

        // The message is directly in value for Instagram
        if (change.field === 'messages' && value.message) {
          const fromId = value.sender?.id || 'unknown'
          const text = value.message?.text || ''

          console.log(`💬 Message from ${fromId}: ${text}`)

          // Store incoming message
          await storeAndReply(fromId, text, value)
        }
      }

      // Handle "messaging" structure (Messenger-style)
      for (const msg of entry.messaging || []) {
        const fromId = msg.sender?.id || msg.from || 'unknown'
        const text = msg.message?.text || msg.text || ''

        console.log(`💬 Messaging from ${fromId}: ${text}`)

        // Store incoming message
        await storeAndReply(fromId, text, msg)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handling error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// Helper function to store message and send AI reply
async function storeAndReply(fromId: string, text: string, rawMsg: Json) {
  if (!text) {
    console.log('⚠️ Empty message, skipping')
    return
  }

  // Store incoming message in Supabase
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.from('instagram_messages').insert({
      instagram_id: fromId,
      direction: 'inbound',
      body: text,
      raw: rawMsg,
    })
    if (error) {
      console.error('❌ Supabase insert error:', error)
    } else {
      console.log('✅ Message stored in Supabase')
    }
  } catch (e) {
    console.error('❌ Supabase insert failed', e)
  }

  // Generate reply via AI
  try {
    const ai = await generateDMResponse(text)
    const replyText =
      (ai as any).answer || (ai as any).response || JSON.stringify(ai)
    console.log('🤖 AI response:', replyText)

    // Send reply to Instagram
    await sendInstagramReply(fromId, replyText)
    console.log('📤 Reply sent to Instagram')

    // Store outbound message
    try {
      const supabase = await createServerClient()
      await supabase.from('instagram_messages').insert({
        instagram_id: fromId,
        direction: 'outbound',
        body: replyText,
        raw: ai as Json,
      })
      console.log('✅ Outbound message stored')
    } catch (e) {
      console.error('❌ Outbound store failed', e)
    }
  } catch (e) {
    console.error('❌ AI reply/send failed', e)
  }
}
