import { NextRequest, NextResponse } from 'next/server'

const IG_API_BASE = 'https://graph.facebook.com/v21.0'

// Debug endpoint to check token validity and get account info
export async function GET(request: NextRequest) {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing FB_PAGE_ACCESS_TOKEN' },
      { status: 500 }
    )
  }

  const results: any = {
    tokenPreview: accessToken.substring(0, 20) + '...',
  }

  try {
    // Check token info
    const debugUrl = `${IG_API_BASE}/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    const debugRes = await fetch(debugUrl)
    results.tokenDebug = await debugRes.json()
  } catch (e) {
    results.tokenDebugError = String(e)
  }

  try {
    // Try to get "me" info
    const meUrl = `${IG_API_BASE}/me?access_token=${accessToken}`
    const meRes = await fetch(meUrl)
    results.me = await meRes.json()
  } catch (e) {
    results.meError = String(e)
  }

  try {
    // Try to get accounts (pages) connected
    const accountsUrl = `${IG_API_BASE}/me/accounts?access_token=${accessToken}`
    const accountsRes = await fetch(accountsUrl)
    results.accounts = await accountsRes.json()
  } catch (e) {
    results.accountsError = String(e)
  }

  // If we got pages, try to get Instagram account for each
  if (results.accounts?.data) {
    for (const page of results.accounts.data) {
      try {
        const igUrl = `${IG_API_BASE}/${
          page.id
        }?fields=instagram_business_account&access_token=${
          page.access_token || accessToken
        }`
        const igRes = await fetch(igUrl)
        page.instagram = await igRes.json()
      } catch (e) {
        page.instagramError = String(e)
      }
    }
  }

  return NextResponse.json(results)
}
