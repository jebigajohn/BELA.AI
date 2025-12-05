import { NextRequest, NextResponse } from 'next/server'
import { verifyHubSignature } from '@/lib/instagram/client'
import { createClient } from '@supabase/supabase-js'
import type { Json } from '@/database.types'

// Admin client that bypasses RLS - wichtig für Webhook ohne Auth
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

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

      // Handle "messaging" structure (Messenger-style / Instagram DM API)
      for (const msg of entry.messaging || []) {
        const senderId = msg.sender?.id
        const recipientId = msg.recipient?.id
        const text = msg.message?.text || ''
        const isEcho = msg.message?.is_echo === true

        console.log(`💬 Messaging:`)
        console.log(`   - Sender ID: ${senderId}`)
        console.log(`   - Recipient ID: ${recipientId}`)
        console.log(`   - Is Echo: ${isEcho}`)
        console.log(`   - Text: ${text}`)

        const myBusinessId = process.env.INSTAGRAM_USER_ID

        if (isEcho) {
          // Echo = Nachricht die WIR gesendet haben
          // sender = unser Business Account, recipient = der Kunde
          console.log(`📤 Echo (outbound) to customer: ${recipientId}`)
          await storeMessage(recipientId!, text, 'outbound', msg)
        } else if (senderId && senderId !== myBusinessId) {
          // Eingehende Nachricht von einem Kunden
          console.log(`📥 Inbound from customer: ${senderId}`)
          await storeMessage(senderId, text, 'inbound', msg)
        } else {
          console.log(`⚠️ Skipping message - sender is our business account`)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handling error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// Helper function to store message
async function storeMessage(
  customerId: string,
  text: string,
  direction: 'inbound' | 'outbound',
  rawMsg: Json
) {
  if (!text) {
    console.log('⚠️ Empty message, skipping')
    return
  }

  console.log(`💾 Storing ${direction} message for customer: ${customerId}`)

  // Store message in Supabase using admin client (bypasses RLS)
  try {
    const { error } = await supabaseAdmin.from('instagram_messages').insert({
      instagram_id: customerId, // Immer die Kunden-ID, nicht unsere!
      direction: direction,
      body: text,
      raw: rawMsg,
    })
    if (error) {
      console.error('❌ Supabase insert error:', error)
    } else {
      console.log(`✅ ${direction} message stored for customer: ${customerId}`)
    }
  } catch (e) {
    console.error('❌ Supabase insert failed', e)
  }
}
