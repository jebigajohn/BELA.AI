import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role for storage operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const ALLOWED_BUCKETS = [
  'hero-photos',
  'nail-inspo',
  'staff-photos',
  'profile-photos',
  'customer-photos',
]

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { data: membership } = await supabaseAdmin
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })
    }

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Ungültiger Bucket' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilder erlaubt' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${ext}`

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload with service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filename)

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { data: membership } = await supabaseAdmin
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const { bucket, filename } = await request.json()

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Ungültiger Bucket' }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: 'Kein Dateiname' }, { status: 400 })
    }

    // Delete with service role
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filename])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { data: membership } = await supabaseAdmin
      .from('studio_members')
      .select('role')
      .eq('profile_id', user.id)
      .single()

    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Ungültiger Bucket' }, { status: 400 })
    }

    // List files with service role
    const { data, error } = await supabaseAdmin.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      console.error('List error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out system files and get public URLs
    const allFiles = (data || [])
      .filter(
        (f) => f.name !== '.emptyFolderPlaceholder' && f.name !== '_order.json'
      )
      .map((f) => ({
        name: f.name,
        url: supabaseAdmin.storage.from(bucket).getPublicUrl(f.name).data
          .publicUrl,
        size: f.metadata?.size || 0,
        createdAt: f.created_at || '',
      }))

    // Check for stored order in database
    let files = allFiles
    try {
      const { data: orderData } = await supabaseAdmin
        .from('storage_order')
        .select('file_order')
        .eq('bucket', bucket)
        .single()

      if (orderData?.file_order && Array.isArray(orderData.file_order)) {
        // Sort files by stored order
        const orderMap = new Map(
          orderData.file_order.map((name: string, index: number) => [
            name,
            index,
          ])
        )
        files = [...allFiles].sort((a, b) => {
          const aOrder = orderMap.get(a.name)
          const bOrder = orderMap.get(b.name)
          if (aOrder !== undefined && bOrder !== undefined)
            return aOrder - bOrder
          if (aOrder !== undefined) return -1
          if (bOrder !== undefined) return 1
          return 0
        })
      }
    } catch {
      // No order found, use default order
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('List API error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
