import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { auth } from '@/lib/auth'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { TS } from '@/translate/components/TServer'
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
        <TS keys="Answers">Question you already answers</TS>
      </Headline>

      {latestAnswers ? (
        latestAnswers.filter(Boolean).map((latestAnswer) => (
          <Suspense key={latestAnswer.answer_id} fallback={null}>
            <AnswerChart answer={latestAnswer} />
          </Suspense>
        ))
      ) : (
        <P>
          <TS keys="Answers">Answer questions to see what others think!</TS>
        </P>
      )}
    </>
  )
}
