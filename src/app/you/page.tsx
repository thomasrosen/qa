import { AboutYouCard } from '@/components/AboutYouCard'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { SessionSchemaType } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AnswerChart } from '../q/[[...path]]/AnswerChart'

export default async function AboutYou() {
  const session = await auth()

  if (isSignedOut(session)) {
    redirect('/')
  }

  const latestAnswers = await getLatestAnswers({ take: 9999 })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <AboutYouCard session={session as SessionSchemaType | null} />

      {latestAnswers ? (
        <Suspense fallback={null}>
          {latestAnswers.filter(Boolean).map((latestAnswer) => (
            <AnswerChart key={latestAnswer.answer_id} answer={latestAnswer} />
          ))}
        </Suspense>
      ) : null}
    </section>
  )
}
