import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a service role client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// Hole die gespeicherte Reihenfolge für einen Bucket aus der Datenbank
async function getStoredOrder(bucket: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('storage_order')
      .select('file_order')
      .eq('bucket', bucket)
      .single()

    if (error || !data) return []

    return data.file_order || []
  } catch {
    return []
  }
}

// Sortiere Dateien nach gespeicherter Reihenfolge
function sortByOrder(
  files: { name: string; url: string }[],
  order: string[]
): string[] {
  if (order.length === 0) {
    return files.map((f) => f.url)
  }

  // Erstelle Map für schnellen Lookup
  const orderMap = new Map(order.map((name, index) => [name, index]))

  // Sortiere: Dateien in der Order zuerst (nach Position), dann Rest
  const sorted = [...files].sort((a, b) => {
    const aOrder = orderMap.get(a.name)
    const bOrder = orderMap.get(b.name)

    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder
    }
    if (aOrder !== undefined) return -1
    if (bOrder !== undefined) return 1
    return 0
  })

  return sorted.map((f) => f.url)
}

export async function getHeroPhotos(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('hero-photos')
      .list('', {
        limit: 50,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error loading hero photos:', error)
      return []
    }

    // Filter out placeholder files and order file
    const files = (data || [])
      .filter(
        (f) =>
          f.name !== '.emptyFolderPlaceholder' &&
          f.name !== '_order.json' &&
          f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      )
      .map((f) => {
        const { data: urlData } = supabaseAdmin.storage
          .from('hero-photos')
          .getPublicUrl(f.name)
        return { name: f.name, url: urlData.publicUrl }
      })

    // Hole gespeicherte Reihenfolge und sortiere
    const order = await getStoredOrder('hero-photos')
    return sortByOrder(files, order)
  } catch (error) {
    console.error('Error in getHeroPhotos:', error)
    return []
  }
}

export async function getNailInspoPhotos(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('nail-inspo')
      .list('', {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error loading nail inspo photos:', error)
      return []
    }

    const photos = (data || [])
      .filter(
        (f) =>
          f.name !== '.emptyFolderPlaceholder' &&
          f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      )
      .map((f) => {
        const { data: urlData } = supabaseAdmin.storage
          .from('nail-inspo')
          .getPublicUrl(f.name)
        return urlData.publicUrl
      })

    return photos
  } catch (error) {
    console.error('Error in getNailInspoPhotos:', error)
    return []
  }
}

export async function getStaffPhotos(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('staff-photos')
      .list('', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error loading staff photos:', error)
      return []
    }

    const photos = (data || [])
      .filter(
        (f) =>
          f.name !== '.emptyFolderPlaceholder' &&
          f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      )
      .map((f) => {
        const { data: urlData } = supabaseAdmin.storage
          .from('staff-photos')
          .getPublicUrl(f.name)
        return urlData.publicUrl
      })

    return photos
  } catch (error) {
    console.error('Error in getStaffPhotos:', error)
    return []
  }
}
