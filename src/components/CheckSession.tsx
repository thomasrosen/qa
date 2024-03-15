import 'server-only'

import { getServerSession } from 'next-auth/next'
import { authOptions } from 'pages/api/auth/[...nextauth]'

export async function CheckSession({
  children,
  noSessionChildren,
}: {
  children: React.ReactNode
  noSessionChildren: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        {noSessionChildren}
      </>
    )
  }

  return (
    <>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {children}
    </>
  )
}
