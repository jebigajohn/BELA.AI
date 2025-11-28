'use client'

import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import PageWrapper from '@/app/components/PageWrapper'

type ProfileClientProps = {
  user: {
    email: string
    name: string
  }
  message?: string
  error?: string
  updateProfileAction: (formData: FormData) => Promise<void>
  changePasswordAction: (formData: FormData) => Promise<void>
}

export default function ProfileClient({
  user,
  message,
  error,
  updateProfileAction,
  changePasswordAction,
}: ProfileClientProps) {
  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        {message && (
          <p className="p-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-md mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md mb-4">
            {error}
          </p>
        )}
        <Card className="mb-8">
          <CardHeader>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </CardHeader>
          <CardContent>
            <form action={updateProfileAction} className="space-y-4">
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
                  defaultValue={user.name}
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
            <form action={changePasswordAction} className="space-y-4">
              <input type="hidden" name="email" value={user.email} />
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
    </PageWrapper>
  )
}
