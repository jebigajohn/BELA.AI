'use client'

import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/button'
import PageWrapper from '@/app/components/PageWrapper'

type Customer = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}

type CustomersClientProps = {
  customers: Customer[]
  error?: string | null
}

export default function CustomersClient({
  customers,
  error,
}: CustomersClientProps) {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-x-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Customers</h1>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600">{error}</p>}
            <ul className="space-y-2 mb-6">
              {customers.map((c) => (
                <li key={c.id} className="border rounded p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium">{c.full_name}</p>
                      <p className="text-sm text-foreground/60">
                        {c.email ?? '—'} · {c.phone ?? '—'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <form
              action="/api/customers/create"
              method="post"
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div>
                <Label>Name</Label>
                <Input name="full_name" required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input name="phone" />
              </div>
              <div className="md:col-span-3">
                <Button type="submit">Add customer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
