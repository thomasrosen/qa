import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function Answers() {
  const session = await auth()

  if (isSignedOut(session)) {
    redirect('/')
  }

  const latestAnswers = await getLatestAnswers({ take: 9999 })

  return (
    <>
      <Headline type="h2">Question you already answers</Headline>

      {latestAnswers ? (
        latestAnswers.filter(Boolean).map((latestAnswer) => (
          <Suspense key={latestAnswer.answer_id} fallback={null}>
            <AnswerChart answer={latestAnswer} />
          </Suspense>
        ))
      ) : (
        <P>Answer questions to see what others think!</P>
      )}
    </>
  )
}
