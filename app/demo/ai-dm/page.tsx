'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import PageWrapper from '@/app/components/PageWrapper'
import type { DMResponse } from '@/lib/ai/schemas'

export default function AIDemoPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<DMResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Beispiel-Anfragen
  const sampleQueries = [
    'Hallo! Wie viel kostet eine Maniküre?',
    'Habt ihr morgen noch einen Termin frei?',
    'Wo befindet ihr euch genau?',
    'Kann ich meinen Termin für Mittwoch stornieren?',
    'Welche Nageldesigns bietet ihr an?',
    'Gibt es einen Rabatt für Neukunden?',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai/dm-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          studioContext: {
            name: '23 Nailroom',
            services: ['Maniküre', 'Pediküre', 'Nail Art', 'Gel Nails'],
            location: 'Ubud, Bali',
          },
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate response')
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchGenerate = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai/dm-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: sampleQueries,
          studioContext: {
            name: '23 Nailroom',
            services: ['Maniküre', 'Pediküre', 'Nail Art', 'Gel Nails'],
            location: 'Ubud, Bali',
          },
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to generate responses')
      }

      const data = await res.json()
      // Zeige die erste Antwort an
      if (data.responses && data.responses.length > 0) {
        setResponse(data.responses[0])
        console.log('All generated responses:', data.responses)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold">
              AI Instagram DM Auto-Antwort Demo
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Teste die automatische Generierung von Instagram DM-Antworten mit
              dem Vercel AI SDK + Google Gemini
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Einzelne Anfrage */}
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Einzelne Kundenanfrage
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="message">Kundenanfrage (Instagram DM)</Label>
                  <Input
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="z.B. Hallo! Wie viel kostet eine Maniküre?"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !message.trim()}>
                  {loading ? 'Generiere...' : 'Antwort generieren'}
                </Button>
              </form>
            </div>

            {/* Beispiel-Anfragen */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-3">Beispiel-Anfragen</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {sampleQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(query)}
                    className="text-left text-sm p-2 rounded border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    disabled={loading}
                  >
                    {query}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleBatchGenerate}
                disabled={loading}
                variant="outline"
              >
                {loading
                  ? 'Generiere...'
                  : `${sampleQueries.length} Antworten auf einmal generieren`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardContent className="pt-6">
              <div className="text-red-600">
                <strong>Fehler:</strong> {error}
                <p className="text-sm mt-2 text-muted-foreground">
                  Stelle sicher, dass GOOGLE_GENERATIVE_AI_API_KEY in .env.local
                  gesetzt ist
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Display */}
        {response && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Generierte Antwort</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  Format: {response.format}
                </span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                  Kategorie: {response.meta.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {response.format === 'direct' && (
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <p className="font-medium mb-2">Antwort:</p>
                    <p className="whitespace-pre-wrap">{response.answer}</p>
                  </div>
                  {response.meta.suggestedAction && (
                    <div className="text-sm">
                      <strong>Vorgeschlagene Aktion:</strong>{' '}
                      {response.meta.suggestedAction}
                    </div>
                  )}
                </div>
              )}

              {response.format === 'detailed' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="font-medium mb-2">Begrüßung:</p>
                    <p>{response.greeting}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <p className="font-medium mb-2">Hauptantwort:</p>
                    <p className="whitespace-pre-wrap">{response.mainAnswer}</p>
                  </div>
                  {response.options && response.options.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Optionen:</p>
                      <div className="space-y-2">
                        {response.options.map((opt, i) => (
                          <div
                            key={i}
                            className="border rounded p-3 bg-neutral-50 dark:bg-neutral-900"
                          >
                            <p className="font-semibold">{opt.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {opt.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                    <p className="font-medium mb-2">Call-to-Action:</p>
                    <p>{response.callToAction}</p>
                  </div>
                </div>
              )}

              {response.format === 'quick-reply' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                    <p className="font-medium mb-2">Nachricht:</p>
                    <p>{response.message}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Quick Replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {response.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Meta-Informationen:</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Topics:</strong> {response.meta.topics.join(', ')}
                  </p>
                </div>
              </div>

              {/* JSON Preview */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  JSON ansehen
                </summary>
                <pre className="mt-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded text-xs overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
