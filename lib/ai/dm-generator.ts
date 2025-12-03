import { google } from '@ai-sdk/google'
import { generateObject, generateText } from 'ai'
import {
  dmResponseSchema,
  multipleResponsesSchema,
  type DMResponse,
  type MultipleResponses,
} from './schemas'

// Stelle sicher, dass GOOGLE_GENERATIVE_AI_API_KEY in .env.local gesetzt ist

/**
 * Generiert eine strukturierte Antwort auf eine Instagram DM
 */
export async function generateDMResponse(
  customerMessage: string,
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

  const disableStructured =
    String(process.env.DISABLE_STRUCTURED_OUTPUTS || 'false').toLowerCase() ===
    'true'

  try {
    if (!disableStructured) {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: dmResponseSchema,
        prompt: `Du bist ein freundlicher Kundenservice-Assistent für ein Nagelstudio.
${context}

Analysiere die folgende Kundenanfrage und erstelle eine passende Antwort:

Kundenanfrage: "${customerMessage}"

Wähle das passende Format:
- "direct": Für einfache Fragen (z.B. Öffnungszeiten, Preise)
- "detailed": Für komplexere Anfragen mit mehreren Optionen
- "quick-reply": Für Fragen, die mit Quick-Reply-Buttons beantwortet werden können

Antworte auf Deutsch, freundlich und professionell. Nutze Emojis sparsam.`,
      })

      return object
    }
  } catch (err) {
    console.error('generateObject failed:', err)
    // fall through to text fallback
  }

  // Fallback: use plain text generation when structured outputs fail or disabled
  const prompt = `Du bist ein freundlicher Kundenservice-Assistent für ein Nagelstudio.\n${context}\n\nBeantworte die Kundenanfrage:\n${customerMessage}\n\nAntworte auf Deutsch, freundlich und professionell.`

  const txt = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  })

  // Map text fallback into a valid DirectAnswer shape so the frontend can read `meta.category` safely
  return {
    format: 'direct',
    answer: txt.text ?? '',
    meta: {
      category: 'general',
      topics: [],
      suggestedAction: 'none',
    },
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
