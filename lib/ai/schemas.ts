import { z } from 'zod'

/**
 * Schema für Instagram DM Antwort-Formate
 */

// Format: Direkte Antwort (kurz und präzise)
export const directAnswerSchema = z.object({
  format: z.literal('direct'),
  answer: z
    .string()
    .describe('Direkte, freundliche Antwort auf die Kundenanfrage'),
  meta: z.object({
    category: z.enum([
      'booking',
      'pricing',
      'availability',
      'services',
      'location',
      'cancellation',
      'general',
    ]),
    topics: z.array(z.string()).describe('Relevante Themen der Anfrage'),
    suggestedAction: z
      .enum(['book_now', 'view_services', 'call_us', 'none'])
      .optional(),
  }),
})

// Format: Detaillierte Antwort mit Optionen
export const detailedAnswerSchema = z.object({
  format: z.literal('detailed'),
  greeting: z.string().describe('Persönliche Begrüßung'),
  mainAnswer: z.string().describe('Hauptantwort auf die Anfrage'),
  options: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .optional()
    .describe('Optionale Auswahlmöglichkeiten für den Kunden'),
  callToAction: z.string().describe('Handlungsaufforderung'),
  meta: z.object({
    category: z.enum([
      'booking',
      'pricing',
      'availability',
      'services',
      'location',
      'cancellation',
      'general',
    ]),
    topics: z.array(z.string()),
  }),
})

// Format: Quick Reply mit Buttons (für Instagram)
export const quickReplySchema = z.object({
  format: z.literal('quick-reply'),
  message: z.string().describe('Kurze Nachricht'),
  quickReplies: z
    .array(z.string())
    .max(3)
    .describe('Bis zu 3 Quick-Reply-Optionen'),
  meta: z.object({
    category: z.enum([
      'booking',
      'pricing',
      'availability',
      'services',
      'location',
      'cancellation',
      'general',
    ]),
    topics: z.array(z.string()),
  }),
})

// Union-Type für alle Antwort-Formate
export const dmResponseSchema = z.discriminatedUnion('format', [
  directAnswerSchema,
  detailedAnswerSchema,
  quickReplySchema,
])

// Schema für mehrere Antworten auf einmal
export const multipleResponsesSchema = z.object({
  responses: z.array(dmResponseSchema),
})

// TypeScript-Typen extrahieren
export type DirectAnswer = z.infer<typeof directAnswerSchema>
export type DetailedAnswer = z.infer<typeof detailedAnswerSchema>
export type QuickReply = z.infer<typeof quickReplySchema>
export type DMResponse = z.infer<typeof dmResponseSchema>
export type MultipleResponses = z.infer<typeof multipleResponsesSchema>
