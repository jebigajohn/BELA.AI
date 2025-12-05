import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import ImageManagerClient from './ImageManagerClient'

// Admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export default async function AdminImagesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin - use admin client to bypass RLS
  const { data: membership } = await supabaseAdmin
    .from('studio_members')
    .select('role')
    .eq('profile_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Bilder verwalten
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Lade Bilder hoch und verwalte sie für verschiedene Bereiche der
            Website.
          </p>
        </div>

        <ImageManagerClient />
      </div>
    </div>
  )
}
