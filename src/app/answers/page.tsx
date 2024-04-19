import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { TS } from '@/components/translate/TServer'
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
      <Headline type="h2">
        <TS>Question you already answers</TS>
      </Headline>

      {latestAnswers ? (
        latestAnswers.filter(Boolean).map((latestAnswer) => (
          <Suspense key={latestAnswer.answer_id} fallback={null}>
            <AnswerChart answer={latestAnswer} />
          </Suspense>
        ))
      ) : (
        <P>
          <TS>Answer questions to see what others think!</TS>
        </P>
      )}
    </>
  )
}
