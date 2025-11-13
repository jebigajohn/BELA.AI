'use client'

import { useRef, useState } from 'react'
import { Button } from '@/app/components/ui/button'

type Service = {
  id: string
  name: string
  price_cents: number
  duration_min: number
}

export default function FormClient({ services }: { services: Service[] }) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/appointments/create', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.success) {
        setMessage(`Termin erfolgreich erstellt. ID: ${json.appointment_id}`)
        form.reset()
      } else {
        setError(json?.error || 'Fehler beim Erstellen des Termins')
      }
    } catch (err: any) {
      setError(err?.message || 'Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Neuen Termin anlegen</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Service</label>
          <select
            name="service_id"
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Bitte wählen</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start</label>
          <div className="relative">
            <input
              type="datetime-local"
              name="starts_at"
              ref={dateInputRef}
              className="w-full border rounded px-3 pr-10 py-2 bg-background input-hide-picker"
              required
            />
            {/* Overlay button that opens the native picker via showPicker() */}
            <button
              type="button"
              aria-label="Datum auswählen"
              onClick={() => {
                const el = dateInputRef.current
                if (!el) return
                // Some browsers expose showPicker(), others require focus+click
                if (typeof (el as any).showPicker === 'function') {
                  ;(el as any).showPicker()
                } else {
                  el.focus()
                  el.click()
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-foreground/5 text-foreground/70"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 2v4m8-4v4M4 11h16M6 22h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Kundenname</label>
            <input
              name="customer_name"
              className="w-full border rounded px-3 py-2"
              placeholder="Vorname Nachname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              name="customer_email"
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="kunde@example.com"
            />
          </div>
        </div>
        <Button disabled={loading} type="submit">
          {loading ? 'Erstelle...' : 'Create appointment'}
        </Button>
      </form>
      {message && <p className="mt-3 text-green-600">{message}</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
    </div>
  )
}
