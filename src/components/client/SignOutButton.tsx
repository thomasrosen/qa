'use client'

import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useCallback } from 'react'

export function SignOutButton({ children }: { children?: React.ReactNode }) {
  const resetID = useCallback(() => signOut(), [])

  return (
    <Button variant="link" className="font-bold h-auto p-0" onClick={resetID}>
      {children || 'Reset ID'}
    </Button>
  )
}
