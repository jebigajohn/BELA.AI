import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Data Deletion Request Callback - GDPR requirement
// Called when user requests deletion of their data
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
      console.error('Invalid signature in data deletion request')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const userId = data.user_id

    // TODO: Delete user's data from your database
    // - Remove instagram_messages for this user
    // - Remove any stored tokens
    // - Remove any other personal data
    console.log('Data deletion requested for user:', userId)

    // Generate a confirmation code for the user to check status
    const confirmationCode = crypto.randomUUID()

    // Facebook expects this specific response format
    return NextResponse.json({
      url: `${
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://gwenda-pavonine-pensionably.ngrok-free.dev'
      }/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
