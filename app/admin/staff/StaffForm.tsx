'use client'
import React, { useRef, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Staff } from './StaffManager'

interface StaffFormProps {
  staff?: Staff | null
  onClose: () => void
  onSaved: () => void
}

export function StaffForm({ staff, onClose, onSaved }: StaffFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    staff?.image_url || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    // Bild-Upload
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: (() => {
          const fd = new FormData()
          fd.append('file', file)
          return fd
        })(),
      })
      const uploadJson = await uploadRes.json()
      if (uploadJson.url) {
        formData.set('image_url', uploadJson.url)
      } else {
        setError('Bild-Upload fehlgeschlagen')
        setLoading(false)
        return
      }
    }
    // Update oder Create
    const endpoint = staff ? '/api/staff/update' : '/api/staff/create'
    const res = await fetch(endpoint, { method: 'POST', body: formData })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Fehler beim Speichern')
      setLoading(false)
      return
    }
    onSaved()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2">
          {staff ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
        </h3>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Name*</label>
          <input
            name="name"
            defaultValue={staff?.name || ''}
            required
            className="input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Rolle*</label>
          <select
            name="role"
            defaultValue={staff?.role || 'Junior Technician'}
            required
            className="input"
          >
            <option value="Junior Technician">Junior Technician</option>
            <option value="Senior Technician">Senior Technician</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">E-Mail</label>
          <input
            name="email"
            type="email"
            defaultValue={staff?.email || ''}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Handy</label>
          <input
            name="phone"
            type="tel"
            defaultValue={staff?.phone || ''}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium">Bild</label>
          <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 bg-neutral-50 dark:bg-neutral-800">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover mb-2"
              />
            ) : (
              <span className="text-neutral-400">Kein Bild</span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Bild auswählen / Drag & Drop
            </Button>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? 'Speichern...' : staff ? 'Speichern' : 'Anlegen'}
        </Button>
      </form>
    </div>
  )
}
