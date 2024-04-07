import { SignIn } from '@/components/SignIn'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { Suspense } from 'react'
import { AnswerChart } from './[[...path]]/AnswerChart'
import NextQuestion from './[[...path]]/NextQuestion'

export const dynamic = 'force-dynamic'

async function LatestAnswerWrapper() {
  const latestAnswers = await getLatestAnswers({ take: 1 })

  return (
    <section className='flex flex-col gap-4 mb-4 place-content-center'>
      {latestAnswers.filter(Boolean).map((latestAnswer) => (
        <AnswerChart key={latestAnswer.answer_id} answer={latestAnswer} />
      ))}
    </section>
  )
}

export default async function Questions() {
  const session = await auth()

  if (isSignedOut(session)) {
    return <SignIn />
  }

  return (
    <>
      <NextQuestion />

      <Suspense>
        <LatestAnswerWrapper />
      </Suspense>
    </>
  )
}
