import { AboutYouCard } from '@/components/client/AboutYouCard'
import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { SessionSchemaType } from '@/lib/types'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function AboutYou() {
  const session = await auth()

  if (isSignedOut(session)) {
    redirect('/')
  }

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Suspense fallback={null}>
        <AboutYouCard session={session as SessionSchemaType | null} />
      </Suspense>

    </section>
  )
}
