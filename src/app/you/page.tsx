import { AboutYouCard } from '@/components/AboutYouCard'
import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { SessionSchemaType } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AboutYou() {
  const session = await auth()

  if (isSignedOut(session)) {
    redirect('/')
  }

  return <AboutYouCard session={session as SessionSchemaType | null} />
}
