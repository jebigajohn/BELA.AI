'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Save,
  MessageCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type BucketType =
  | 'hero-photos'
  | 'nail-inspo'
  | 'staff-photos'
  | 'profile-photos'
  | 'customer-photos'

interface FileItem {
  name: string
  url: string
  size: number
  createdAt: string
  order?: number
}

const BUCKETS: { id: BucketType; label: string; description: string }[] = [
  {
    id: 'hero-photos',
    label: 'Hero Fotos',
    description: 'Bilder für die Startseiten-Galerie (Reihenfolge zählt!)',
  },
  {
    id: 'nail-inspo',
    label: 'Nail Inspiration',
    description: 'Beispielbilder für Nageldesigns',
  },
  {
    id: 'staff-photos',
    label: 'Team Fotos',
    description: 'Fotos der Mitarbeiter',
  },
  {
    id: 'profile-photos',
    label: 'Profil Fotos',
    description: 'Profilbilder (privat)',
  },
  {
    id: 'customer-photos',
    label: 'Kunden Fotos',
    description: 'Kundenbilder (privat)',
  },
]

export default function ImageManagerClient() {
  const [selectedBucket, setSelectedBucket] =
    useState<BucketType>('hero-photos')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hasOrderChanged, setHasOrderChanged] = useState(false)

  const loadFiles = useCallback(async (bucket: BucketType) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/storage?bucket=${bucket}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Fehler beim Laden')

      setFiles(data.files || [])
      setHasOrderChanged(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBucketChange = (bucket: BucketType) => {
    setSelectedBucket(bucket)
    loadFiles(bucket)
  }

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} ist kein Bild`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', selectedBucket)

        const res = await fetch('/api/storage', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen')
      }

      setSuccess(`${fileList.length} Bild(er) hochgeladen!`)
      await loadFiles(selectedBucket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`"${filename}" wirklich löschen?`)) return

    try {
      const res = await fetch('/api/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket: selectedBucket, filename }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Löschen fehlgeschlagen')

      setFiles(files.filter((f) => f.name !== filename))
      setSuccess('Bild gelöscht!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleUpload(e.dataTransfer.files)
    },
    [selectedBucket]
  )

  // Drag & Drop Sortierung
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedItem = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedItem)
    setFiles(newFiles)
    setDraggedIndex(index)
    setHasOrderChanged(true)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const saveOrder = async () => {
    try {
      const res = await fetch('/api/storage/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          order: files.map((f) => f.name),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Speichern fehlgeschlagen')

      setSuccess('Reihenfolge gespeichert!')
      setHasOrderChanged(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  useEffect(() => {
    loadFiles(selectedBucket)
  }, [selectedBucket, loadFiles])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="space-y-6">
      {/* Quick Links für Admin */}
      <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
        <Link
          href="/demo/ai-dm"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <MessageCircle size={18} />
          <span>Instagram DMs öffnen</span>
        </Link>
        <span className="text-sm text-purple-700 dark:text-purple-300">
          Hier kannst du die gefetchten Instagram Nachrichten sehen und
          beantworten
        </span>
      </div>

      {/* Bucket Selector */}
      <div className="flex flex-wrap gap-2">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket.id}
            onClick={() => handleBucketChange(bucket.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedBucket === bucket.id
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {bucket.label}
          </button>
        ))}
      </div>

      {/* Bucket Info */}
      <p className="text-sm text-neutral-500">
        {BUCKETS.find((b) => b.id === selectedBucket)?.description}
      </p>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-neutral-300 dark:border-neutral-700'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-neutral-400" />
          )}
          <div>
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Bilder hochladen
            </span>
            <span className="text-neutral-500"> oder hierher ziehen</span>
          </div>
          <p className="text-sm text-neutral-400">PNG, JPG, WebP bis 10MB</p>
        </label>
      </div>

      {/* Save Order Button */}
      {hasOrderChanged && (
        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <span className="text-yellow-700 dark:text-yellow-400">
            Reihenfolge wurde geändert
          </span>
          <button
            onClick={saveOrder}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Save size={18} />
            Reihenfolge speichern
          </button>
        </div>
      )}

      {/* Sorting Instructions */}
      {files.length > 1 && selectedBucket === 'hero-photos' && (
        <p className="text-sm text-neutral-500 flex items-center gap-2">
          <GripVertical size={16} />
          Ziehe die Bilder um die Reihenfolge zu ändern. Das erste Bild wird
          groß auf der Startseite angezeigt.
        </p>
      )}

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Noch keine Bilder in diesem Bucket</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <div
              key={file.name}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-move ${
                draggedIndex === index ? 'opacity-50 scale-95' : ''
              } ${
                index === 0 && selectedBucket === 'hero-photos'
                  ? 'ring-2 ring-purple-500'
                  : ''
              }`}
            >
              {/* Order Badge */}
              {selectedBucket === 'hero-photos' && (
                <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              )}

              <Image
                src={file.url}
                alt={file.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Drag Handle */}
              <div className="absolute top-2 right-2 z-10 p-1 bg-white/80 dark:bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical
                  size={16}
                  className="text-neutral-600 dark:text-neutral-300"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(file.name)
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{file.name}</p>
                <p className="text-white/70 text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Count */}
      {files.length > 0 && (
        <p className="text-sm text-neutral-500 text-center">
          {files.length} {files.length === 1 ? 'Bild' : 'Bilder'}
        </p>
      )}
    </div>
  )
}
