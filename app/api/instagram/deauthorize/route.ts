import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Deauthorize Callback - Called when user removes the app from their Instagram
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const signedRequest = params.get('signed_request')

    if (!signedRequest) {
      return NextResponse.json(
        { error: 'Missing signed_request' },
        { status: 400 }
      )
    }

    // Parse and verify the signed request
    const [signature, payload] = signedRequest.split('.')
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.FB_APP_SECRET!)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    if (signature !== expectedSignature) {
      console.error('Invalid signature in deauthorize request')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const userId = data.user_id

    // TODO: Remove user's Instagram connection from your database
    console.log('User deauthorized app:', userId)

    // Facebook expects a 200 response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deauthorize error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
