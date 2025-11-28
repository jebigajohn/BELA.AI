import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user.email!

  async function updateProfile(formData: FormData) {
    'use server'

    const fullName = formData.get('fullName') as string
    const supabase = await createServerClient()

    const { error } = await supabase.auth.updateUser({
      data: { name: fullName },
    })

    if (error) {
      redirect(`/profile?error=${encodeURIComponent(error.message)}`)
    }
    redirect(
      `/profile?message=${encodeURIComponent('Profile successfully updated!')}`
    )
  }

  async function changePassword(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string
    const supabase = await createServerClient()

    // 1. Check if the old password is correct by trying to sign in with it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    })

    if (signInError) {
      redirect(
        `/profile?error=${encodeURIComponent('Incorrect old password.')}`
      )
    }

    // 2. If old password is correct, update to the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      redirect(`/profile?error=${encodeURIComponent(updateError.message)}`)
    }

    redirect(
      `/profile?message=${encodeURIComponent('Password successfully updated!')}`
    )
  }

  return (
    <ProfileClient
      user={{
        email: user.email!,
        name: user.user_metadata.name ?? '',
      }}
      message={params.message}
      error={params.error}
      updateProfileAction={updateProfile}
      changePasswordAction={changePassword}
    />
  )
}
