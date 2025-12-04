'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DataDeletionContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Datenlöschung abgeschlossen
          </h1>
          <p className="text-muted-foreground">
            Ihre Daten wurden erfolgreich aus unserem System gelöscht.
          </p>
        </div>

        {code && (
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              Bestätigungscode:
            </p>
            <p className="font-mono text-sm break-all">{code}</p>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Folgende Daten wurden gelöscht:</p>
          <ul className="list-disc list-inside text-left">
            <li>Instagram Nachrichten</li>
            <li>Konversationsverläufe</li>
            <li>Verknüpfte Kontoinformationen</li>
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Bei Fragen kontaktieren Sie uns unter{' '}
            <a
              href="mailto:privacy@23nailroom.com"
              className="text-primary hover:underline"
            >
              privacy@23nailroom.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DataDeletionStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Laden...</p>
        </div>
      }
    >
      <DataDeletionContent />
    </Suspense>
  )
}
