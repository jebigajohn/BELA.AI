import { z } from 'zod'

/**
 * Einfaches Schema für Instagram DM Antworten
 * Wir brauchen nur die Antwort - kein komplexes Format-System
 */

// Einfaches Schema: nur die Antwort
export const dmResponseSchema = z.object({
  answer: z.string().describe('Die freundliche Antwort an den Kunden'),
})

// Für Abwärtskompatibilität - exportieren wir auch die alten Schemas
export const directAnswerSchema = dmResponseSchema
export const detailedAnswerSchema = dmResponseSchema
export const quickReplySchema = dmResponseSchema

// Schema für mehrere Antworten auf einmal
export const multipleResponsesSchema = z.object({
  responses: z.array(dmResponseSchema),
})

// TypeScript-Typen extrahieren
export type DMResponse = z.infer<typeof dmResponseSchema>
export type DirectAnswer = DMResponse
export type DetailedAnswer = DMResponse
export type QuickReply = DMResponse
export type MultipleResponses = z.infer<typeof multipleResponsesSchema>
