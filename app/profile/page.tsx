import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'

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
    <div className="flex min-h-screen">
      {/* Sidebar placeholder to prevent overlap */}
      <aside className="w-64 shrink-0" aria-hidden="true" />
      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 p-8 overflow-auto">
        <div className="max-w-xl mx-auto">
          {params.message && (
            <p className="p-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-md mb-4">
              {params.message}
            </p>
          )}
          {params.error && (
            <p className="p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md mb-4">
              {params.error}
            </p>
          )}
          <Card className="mb-8">
            <CardHeader>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </CardHeader>
            <CardContent>
              <form action={updateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-neutral-100 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    defaultValue={user.user_metadata.name ?? ''}
                    required
                  />
                </div>
                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Change Password</h2>
            </CardHeader>
            <CardContent>
              <form action={changePassword} className="space-y-4">
                <input type="hidden" name="email" value={userEmail} />
                <div>
                  <Label htmlFor="oldPassword">Old Password</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
