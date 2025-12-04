import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AIDMClient from './AIDMClient'

export default async function InstagramDMPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirect=/demo/ai-dm')
  }

  return <AIDMClient />
}
