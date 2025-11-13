import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full border rounded px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-foreground/20',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
