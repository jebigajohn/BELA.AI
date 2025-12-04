import { NextResponse } from 'next/server'

// GET /api/instagram/debug/test-api - Testet API-Aufrufe mit dem App-Token
export async function GET() {
  const accessToken = process.env.IG_ACCESS_TOKEN
  const instagramUserId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !instagramUserId) {
    return NextResponse.json(
      { error: 'Missing IG_ACCESS_TOKEN or INSTAGRAM_USER_ID' },
      { status: 500 }
    )
  }

  const results: Record<string, unknown> = {}

  // Test 1: Profile abrufen (instagram_business_basic)
  try {
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/${instagramUserId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${accessToken}`
    )
    results.profile = await profileRes.json()
  } catch (err) {
    results.profile = { error: String(err) }
  }

  // Test 2: Conversations abrufen (instagram_business_manage_messages)
  try {
    const convRes = await fetch(
      `https://graph.instagram.com/v21.0/${instagramUserId}/conversations?platform=instagram&access_token=${accessToken}`
    )
    results.conversations = await convRes.json()
  } catch (err) {
    results.conversations = { error: String(err) }
  }

  // Test 3: Token Debug Info
  try {
    const debugRes = await fetch(
      `https://graph.instagram.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    )
    results.tokenDebug = await debugRes.json()
  } catch (err) {
    results.tokenDebug = { error: String(err) }
  }

  return NextResponse.json({
    success: true,
    message:
      'API tests completed - these calls count towards your app statistics!',
    timestamp: new Date().toISOString(),
    results,
  })
}
