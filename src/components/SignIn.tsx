'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

export function SignIn() {
  return (
    <Button variant="secondary" onClick={() => signIn('anonymous', {})}>
      Sign in Anonymously
    </Button>
  )
}
