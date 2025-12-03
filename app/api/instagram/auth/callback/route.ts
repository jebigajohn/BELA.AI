import { NextRequest, NextResponse } from 'next/server'

// OAuth Callback - Instagram redirects here after user authorizes
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorReason = url.searchParams.get('error_reason')

  if (error) {
    console.error('Instagram OAuth error:', error, errorReason)
    return NextResponse.redirect(
      new URL('/login?error=instagram_denied', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://api.instagram.com/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.FB_APP_ID!,
          client_secret: process.env.FB_APP_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: `${
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://gwenda-pavonine-pensionably.ngrok-free.dev'
          }/api/instagram/auth/callback`,
          code,
        }),
      }
    )

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData)
      return NextResponse.redirect(
        new URL('/login?error=token_exchange', request.url)
      )
    }

    // Get long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.FB_APP_SECRET}&access_token=${tokenData.access_token}`
    )
    const longLivedData = await longLivedResponse.json()

    // TODO: Store the access token securely (in database, associated with user)
    console.log('Instagram auth successful:', {
      user_id: tokenData.user_id,
      access_token: longLivedData.access_token ? '***' : 'missing',
      expires_in: longLivedData.expires_in,
    })

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/profile?instagram=connected', request.url)
    )
  } catch (error) {
    console.error('Instagram auth error:', error)
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', request.url)
    )
  }
}
