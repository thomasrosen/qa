import 'server-only'

import { SignIn } from '@/components/SignIn'
import { SignOut } from '@/components/SignOut'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { Suspense } from 'react'

export async function CheckSession({
  children,
  noSessionChildren,
}: {
  children: React.ReactNode
  noSessionChildren: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log('session', session)

  if (!session) {
    return (
      <>
        <Suspense>
          <SignIn />
        </Suspense>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        {noSessionChildren}
      </>
    )
  }

  return (
    <>
      <Suspense>
        <SignOut />
      </Suspense>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {children}
    </>
  )
}
