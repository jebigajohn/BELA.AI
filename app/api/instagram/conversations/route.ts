import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export interface Conversation {
  instagram_id: string
  last_message: string
  last_message_at: string
  unread_count: number
  messages: Message[]
}

export interface Message {
  id: number
  instagram_id: string
  direction: 'inbound' | 'outbound'
  body: string | null
  created_at: string
  raw: any
}

// GET /api/instagram/conversations - Alle Conversations aus Supabase abrufen
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Alle Messages holen, nach Datum sortiert
    const { data: messages, error } = await supabase
      .from('instagram_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Gruppiere nach instagram_id
    const conversationsMap = new Map<string, Conversation>()

    for (const msg of messages || []) {
      const existing = conversationsMap.get(msg.instagram_id)

      if (existing) {
        existing.messages.push(msg as Message)
        existing.last_message = msg.body || ''
        existing.last_message_at = msg.created_at
        if (msg.direction === 'inbound') {
          existing.unread_count++
        }
      } else {
        conversationsMap.set(msg.instagram_id, {
          instagram_id: msg.instagram_id,
          last_message: msg.body || '',
          last_message_at: msg.created_at,
          unread_count: msg.direction === 'inbound' ? 1 : 0,
          messages: [msg as Message],
        })
      }
    }

    // Sortiere Conversations nach letzter Nachricht (neueste zuerst)
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    )

    return NextResponse.json({ conversations })
  } catch (err) {
    console.error('Error fetching conversations:', err)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
