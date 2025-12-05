import { google } from '@ai-sdk/google'
import { generateObject, generateText } from 'ai'
import {
  dmResponseSchema,
  multipleResponsesSchema,
  type DMResponse,
  type MultipleResponses,
} from './schemas'

// Stelle sicher, dass GOOGLE_GENERATIVE_AI_API_KEY in .env.local gesetzt ist

export interface ChatMessage {
  direction: 'inbound' | 'outbound'
  body: string
}

/**
 * Generiert eine strukturierte Antwort auf eine Instagram DM
 */
export async function generateDMResponse(
  customerMessage: string,
  studioContext?: {
    name?: string
    services?: string[]
    location?: string
  },
  chatHistory?: ChatMessage[]
): Promise<DMResponse> {
  const context = studioContext
    ? `
Studio Info:
- Name: ${studioContext.name || '23 Nailroom'}
- Services: ${studioContext.services?.join(', ') || 'Nail Services'}
- Location: ${studioContext.location || 'Bali'}
`
    : ''

  // Format chat history for context
  let historyContext = ''
  if (chatHistory && chatHistory.length > 0) {
    historyContext = `
Previous conversation:
${chatHistory
  .map(
    (msg) => `${msg.direction === 'inbound' ? 'Customer' : 'You'}: ${msg.body}`
  )
  .join('\n')}

---
`
  }

  const isFirstMessage = !chatHistory || chatHistory.length === 0

  const disableStructured =
    String(process.env.DISABLE_STRUCTURED_OUTPUTS || 'false').toLowerCase() ===
    'true'

  try {
    if (!disableStructured) {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: dmResponseSchema,
        prompt: `You are the friendly Instagram customer service for "23 Nailroom", a nail studio in Bali.
${context}
${historyContext}
Customer's latest message: "${customerMessage}"

Your communication style:
${
  isFirstMessage
    ? '- Start with a friendly greeting (e.g. "Hi there! 🌺" or "Hey! 💅🏻")'
    : '- DO NOT greet again if you already greeted in the conversation above'
}
${
  isFirstMessage
    ? '- Thank them for reaching out'
    : '- Continue the conversation naturally'
}
- Be warm and use fitting emojis (🌺💅🏻✨💗🪭👱🏼‍♀️)
- Ask follow-up questions if needed (e.g. "with or without gel?")
- Mention Happy Hour: 10% off when booking 10am-12pm via Fresha
- Link to price list: https://linktr.ee/23nailroombali
- End with "Love, 23 Nailroom"

IMPORTANT:
- Reply in ENGLISH
- Max 800 characters
- ${
          isFirstMessage
            ? 'This is the first message - greet them!'
            : 'This is a follow-up message - DO NOT say "Hi there" or "Thanks for reaching out" again!'
        }
- Answer their question directly based on the conversation context
- Return ONLY the "answer" field with your response text`,
      })

      return object
    }
  } catch (err) {
    console.error('generateObject failed:', err)
    // fall through to text fallback
  }

  // Fallback: use plain text generation when structured outputs fail or disabled
  const prompt = `You are the friendly Instagram customer service for "23 Nailroom", a nail studio in Bali.
${context}
${historyContext}
Customer's latest message: "${customerMessage}"

Your communication style:
${
  isFirstMessage
    ? '- Start with a friendly greeting (e.g. "Hi there! 🌺")'
    : '- DO NOT greet again - continue the conversation naturally'
}
${
  isFirstMessage
    ? '- Thank them for reaching out'
    : '- Answer their question directly'
}
- Be warm and use fitting emojis (🌺💅🏻✨💗🪭👱🏼‍♀️)
- Mention Happy Hour: 10% off when booking 10am-12pm via Fresha
- Link to price list: https://linktr.ee/23nailroombali
- End with "Love, 23 Nailroom"

IMPORTANT:
- Reply in ENGLISH
- Max 800 characters
- ${
    isFirstMessage
      ? 'This is the first message!'
      : 'This is a follow-up - NO greeting!'
  }`

  const txt = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  })

  // Return simple answer object
  return {
    answer: txt.text ?? '',
  } as DMResponse
}

/**
 * Generiert mehrere Beispiel-Antworten für verschiedene Kundenanfragen
 */
export async function generateMultipleDMResponses(
  sampleQueries: string[],
  studioContext?: {
    name?: string
    services?: string[]
    location?: string
  }
): Promise<MultipleResponses> {
  const context = studioContext
    ? `
Studio Info:
- Name: ${studioContext.name || '23 Nailroom'}
- Services: ${studioContext.services?.join(', ') || 'Nail Services'}
- Location: ${studioContext.location || 'Bali'}
`
    : ''

  const queriesText = sampleQueries.map((q, i) => `${i + 1}. "${q}"`).join('\n')

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: multipleResponsesSchema,
      prompt: `Du bist ein freundlicher Kundenservice-Assistent für ein Nagelstudio.
${context}

Erstelle passende Antworten für folgende Kundenanfragen:

${queriesText}

Für jede Anfrage:
- Wähle das passende Format (direct, detailed, oder quick-reply)
- Antworte auf Deutsch, freundlich und professionell
- Nutze Emojis sparsam
- Kategorisiere die Anfrage korrekt`,
    })

    return object
  } catch (err) {
    console.error('generateObject (multiple) failed:', err)

    // Fallback: generate plain text answers for each query and map to DirectAnswer
    const results = await Promise.all(
      sampleQueries.map(async (q) => {
        const t = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: q,
        })
        return {
          format: 'direct',
          answer: t.text ?? '',
          meta: { category: 'general', topics: [], suggestedAction: 'none' },
        } as DMResponse
      })
    )

    return { responses: results }
  }
}

/**
 * Generiert eine Antwort mit einem bestimmten Format
 */
export async function generateDMResponseWithFormat(
  customerMessage: string,
  format: 'direct' | 'detailed' | 'quick-reply',
  studioContext?: {
    name?: string
    services?: string[]
    location?: string
  }
): Promise<DMResponse> {
  const context = studioContext
    ? `
Studio Info:
- Name: ${studioContext.name || '23 Nailroom'}
- Services: ${studioContext.services?.join(', ') || 'Nail Services'}
- Location: ${studioContext.location || 'Bali'}
`
    : ''

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: dmResponseSchema,
    prompt: `Du bist ein freundlicher Kundenservice-Assistent für ein Nagelstudio.
${context}

Analysiere die folgende Kundenanfrage und erstelle eine Antwort im Format "${format}":

Kundenanfrage: "${customerMessage}"

Format: ${format}
Antworte auf Deutsch, freundlich und professionell. Nutze Emojis sparsam.`,
  })

  return object
}
