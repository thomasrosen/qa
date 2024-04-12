import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import NextQuestion from '@/components/NextQuestion'
import { SignIn } from '@/components/client/SignIn'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function LatestAnswerWrapper() {
  const latestAnswers = await getLatestAnswers({ take: 1 })

  if (latestAnswers.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
        Recent Answers
      </Headline>
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
  if (Array.isArray(path)) {
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
