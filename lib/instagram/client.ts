import fetch from 'node-fetch'

// Instagram Graph API für Messaging
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID
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

export function verifyHubSignature(_payload: string, _signature: string) {
  // Signature verification placeholder — implement HMAC verification if needed
  return true
}
