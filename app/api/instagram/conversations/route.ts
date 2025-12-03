import { NextRequest, NextResponse } from 'next/server'

const IG_API_BASE = 'https://graph.facebook.com/v21.0'

// GET - Fetch Instagram conversations/DMs
export async function GET(request: NextRequest) {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN
  const igUserId = process.env.INSTAGRAM_USER_ID

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing FB_PAGE_ACCESS_TOKEN' },
      { status: 500 }
    )
  }

  if (!igUserId) {
    return NextResponse.json(
      { error: 'Missing INSTAGRAM_USER_ID - set it in .env.local' },
      { status: 500 }
    )
  }

  try {
    // Fetch conversations
    const conversationsUrl = `${IG_API_BASE}/${igUserId}/conversations?platform=instagram&access_token=${accessToken}`

    const res = await fetch(conversationsUrl)
    const data = await res.json()

    if (data.error) {
      console.error('Instagram API error:', data.error)
      return NextResponse.json(
        { error: data.error.message, code: data.error.code },
        { status: 400 }
      )
    }

    // For each conversation, fetch messages
    const conversationsWithMessages = await Promise.all(
      (data.data || []).map(async (conv: any) => {
        const messagesUrl = `${IG_API_BASE}/${conv.id}?fields=messages{message,from,created_time}&access_token=${accessToken}`
        const msgRes = await fetch(messagesUrl)
        const msgData = await msgRes.json()

        return {
          ...conv,
          messages: msgData.messages?.data || [],
        }
      })
    )

    return NextResponse.json({
      conversations: conversationsWithMessages,
      raw: data,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: String(error) },
      { status: 500 }
    )
  }
}
