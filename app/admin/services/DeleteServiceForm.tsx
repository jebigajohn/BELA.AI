'use client'
import { Button } from '@/app/components/ui/button'

export function DeleteServiceForm({
  deleteService,
  id,
}: {
  deleteService: (formData: FormData) => void
  id: string
}) {
  return (
    <form action={deleteService}>
      <input type="hidden" name="id" value={id} />
      <Button variant="destructive" type="submit">
        Delete
      </Button>
    </form>
  )
}
