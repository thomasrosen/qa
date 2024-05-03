'use client'

import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useCallback } from 'react'

export function SignOutButton({
  children,
  ...props
}: {
  children?: React.ReactNode
  [key: string]: any
}) {
  const resetID = useCallback(() => signOut(), [])

  return (
    <Button onClick={resetID} {...props}>
      {children || 'Sign Out'}
    </Button>
  )
}
