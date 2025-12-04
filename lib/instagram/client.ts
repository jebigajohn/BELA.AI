import fetch from 'node-fetch'
import crypto from 'crypto'

// Instagram Graph API für Messaging
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID
const FB_APP_SECRET = process.env.FB_APP_SECRET
const IG_API_BASE = 'https://graph.instagram.com/v21.0'

if (!IG_ACCESS_TOKEN) {
  console.warn('IG_ACCESS_TOKEN not set — Instagram messaging will not work')
}

if (!INSTAGRAM_USER_ID) {
  console.warn('INSTAGRAM_USER_ID not set — Instagram messaging will not work')
}

export async function sendInstagramReply(
  recipientId: string,
  message: string
): Promise<any> {
  if (!IG_ACCESS_TOKEN) throw new Error('Missing IG_ACCESS_TOKEN')
  if (!INSTAGRAM_USER_ID) throw new Error('Missing INSTAGRAM_USER_ID')

  // Instagram Messaging API endpoint
  const url = `${IG_API_BASE}/${INSTAGRAM_USER_ID}/messages`

  const body = {
    recipient: { id: recipientId },
    message: { text: message },
  }

  const res = await fetch(url + `?access_token=${IG_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data
}

export function verifyHubSignature(
  payload: string,
  signature: string
): boolean {
  if (!FB_APP_SECRET) {
    console.warn('FB_APP_SECRET not set — skipping signature verification')
    return false
  }

  if (!signature) {
    console.warn('No signature provided')
    return false
  }

  // Meta sendet die Signatur als "sha256=XXXXX"
  const signatureParts = signature.split('=')
  if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') {
    console.warn('Invalid signature format')
    return false
  }

  const expectedSignature = signatureParts[1]
  const computedSignature = crypto
    .createHmac('sha256', FB_APP_SECRET)
    .update(payload)
    .digest('hex')

  // Timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(computedSignature)
  )
}
