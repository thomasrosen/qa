'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group orange"
      toastOptions={{
        closeButton: true,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-0 group-[.toaster]:shadow-none group-[.toaster]:rounded-lg group-[.toaster]:whitespace-normal',
          description: 'group-[.toast]:text-card-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
