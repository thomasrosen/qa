import { AnswerChart } from '@/components/AnswerChart'
import { AboutYouCard } from '@/components/client/AboutYouCard'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { SessionSchemaType } from '@/lib/types'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function AboutYou() {
  const session = await auth()

  if (isSignedOut(session)) {
    redirect('/')
  }

  const latestAnswers = await getLatestAnswers({ take: 9999 })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <AboutYouCard session={session as SessionSchemaType | null} />

      {latestAnswers
        ? latestAnswers.filter(Boolean).map((latestAnswer) => (
            <Suspense key={latestAnswer.answer_id} fallback={null}>
              <AnswerChart answer={latestAnswer} />
            </Suspense>
          ))
        : null}
    </section>
  )
}
