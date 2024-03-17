import { AboutYouCard } from '@/components/AboutYouCard'
import { isSignedOut } from '@/lib/isSignedIn'
import { SessionSchemaType } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function AboutYou() {
  const session = await getServerSession()

  if (isSignedOut(session)) {
    redirect('/')
  }

  return (
    <div>
      <AboutYouCard session={session as SessionSchemaType | null} />
    </div>
  )
}
