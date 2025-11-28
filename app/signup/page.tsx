'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // Depending on email confirmation settings, user may need to confirm
        setMessage(
          'Bitte prüfe deine E-Mail, um die Registrierung zu bestätigen.'
        )
        router.replace('/demo/services')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Platzhalter, gleiche Breite wie AdminLayout, immer sichtbar */}
      <aside className="w-64 shrink-0" aria-hidden="true" />
      <main className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-8 overflow-auto">
        <Card className="w-full max-w-sm mx-auto shadow-xl">
          <CardHeader>
            <h1 className="text-xl font-semibold">Sign Up</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Passwort</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button disabled={loading} className="w-full">
                {loading ? 'Registriere…' : 'Sign Up'}
              </Button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {message && <p className="text-green-600 text-sm">{message}</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
