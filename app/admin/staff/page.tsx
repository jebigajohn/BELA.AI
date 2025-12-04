import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StaffManager from './StaffManager'

export default async function StaffPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirect=/admin/staff')
  }

  return <StaffManager />
}
