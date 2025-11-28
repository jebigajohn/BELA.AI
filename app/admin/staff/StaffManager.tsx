'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { StaffForm } from './StaffForm'

export type Staff = {
  id: string
  name: string
  role: 'Junior Technician' | 'Senior Technician'
  image_url?: string
  email?: string
  phone?: string
  created_at?: string
}

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [selected, setSelected] = useState<Staff | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/staff/list')
      .then((res) => res.json())
      .then((data) => setStaff(data.staff || []))
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mitarbeiter verwalten</h2>
        <Button
          onClick={() => {
            setSelected(null)
            setShowForm(true)
          }}
        >
          + Neuer Mitarbeiter
        </Button>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 dark:border-neutral-800">
              <th>Name</th>
              <th>Rolle</th>
              <th>Kontakt</th>
              <th>Bild</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr
                key={s.id}
                className="border-b border-neutral-100 dark:border-neutral-800"
              >
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td>{s.email || s.phone || '-'}</td>
                <td>
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-neutral-400">–</span>
                  )}
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelected(s)
                      setShowForm(true)
                    }}
                  >
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <StaffForm
          staff={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            fetch('/api/staff/list')
              .then((res) => res.json())
              .then((data) => setStaff(data.staff || []))
          }}
        />
      )}
    </div>
  )
}
