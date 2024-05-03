'use client'

import { deleteAccount } from '@/actions/deleteAccount'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function DeleteAccountButton({
  children,
  loading = 'Loading…',
  ...props
}: {
  children?: React.ReactNode
  loading?: React.ReactNode
  [key: string]: any
}) {
  const [isLoading, setIsLoading] = useState(false)

  const deleteAccountHandler = useCallback(async () => {
    setIsLoading(true)
    const response = await deleteAccount()
    setIsLoading(false)

    if (response === true) {
      toast.success('✅ Your account got deleted.')
      setTimeout(() => {
        signOut()
      }, 500)
    } else {
      toast.error(
        '❌ Something went wrong. Please contact hello@thomasrosen.me'
      )
    }
  }, [])

  return (
    <>
      <Button onClick={deleteAccountHandler} {...props}>
        {isLoading ? loading : children || 'Delete Account'}
      </Button>
    </>
  )
}
