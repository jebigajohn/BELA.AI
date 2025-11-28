'use client'

import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import FormClient from './FormClient'
import PageWrapper from '@/app/components/PageWrapper'

type Service = {
  id: string
  name: string
  price_cents: number
  duration_min: number
}

function formatCents(cents?: number) {
  const n = (cents ?? 0) / 100
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

type ServicesClientProps = {
  services: Service[]
  error?: string | null
}

export default function ServicesClient({
  services,
  error,
}: ServicesClientProps) {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-x-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Services</h1>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-red-600">
                Error loading services{error ? `: ${error}` : ''}
              </p>
            )}
            <ul className="grid grid-cols-1 gap-3">
              {services.map((s: Service) => (
                <li key={s.id} className="border rounded p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-foreground/60">
                        {s.duration_min} min
                      </p>
                    </div>
                    <div className="text-indigo-600 font-semibold">
                      {formatCents(s.price_cents)} EUR
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <FormClient services={services} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
