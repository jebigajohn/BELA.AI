import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase/server'

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
    console.log('Data deletion requested for user:', userId)

    // Delete user's data from database
    const supabase = await createServerClient()
    
    // Delete all messages from/to this user
    const { error: deleteError } = await supabase
      .from('instagram_messages')
      .delete()
      .eq('instagram_id', userId)
    
    if (deleteError) {
      console.error('Error deleting user data:', deleteError)
    } else {
      console.log('Successfully deleted data for user:', userId)
    }

    // Generate a confirmation code for the user to check status
    const confirmationCode = crypto.randomUUID()

    // Facebook expects this specific response format
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bela-ai-kappa.vercel.app'
    
    return NextResponse.json({
      url: `${appUrl}/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
