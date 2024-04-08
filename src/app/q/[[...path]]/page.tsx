import { SignIn } from '@/components/SignIn'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { Suspense } from 'react'
import { AnswerChart } from './AnswerChart'
import NextQuestion from './NextQuestion'

export const dynamic = 'force-dynamic'

async function LatestAnswerWrapper() {
  const latestAnswers = await getLatestAnswers({ take: 1 })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      {latestAnswers.filter(Boolean).map((latestAnswer) => (
        <AnswerChart key={latestAnswer.answer_id} answer={latestAnswer} />
      ))}
    </section>
  )
}

export default async function Questions({
  params: { path },
}: {
  params: { path: string[] }
}) {
  let id: string | undefined = undefined
  if (Array.isArray(id)) {
    id = path[0]
  } else if (typeof path === 'string') {
    id = path
  }

  const session = await auth()
  if (isSignedOut(session)) {
    return <SignIn />
  }

  return (
    <>
      <Suspense>
        <NextQuestion id={id} />
      </Suspense>

      <Suspense>
        <LatestAnswerWrapper />
      </Suspense>
    </>
  )
}
