import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { auth } from '@/lib/auth'
import { getAnswers } from '@/lib/getAnswers'
import { getFirstValue } from '@/lib/getFirstValue'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedOut } from '@/lib/isSignedIn'
import { AnswerType, PreloadedAnswer } from '@/lib/types'
import { TS } from '@/translate/components/TServer'
import { redirect } from 'next/navigation'

export default async function AnswersPage() {
  const session = await auth()
  if (isSignedOut(session)) {
    redirect('/')
  }

  // @ts-ignore already checked with isSignedOut()
  const user_id = session.user.id

  // preload latest answers
  let latestAnswers: AnswerType[] = await getLatestAnswers({
    where: { createdBy_id: user_id },
    take: 9999,
  })

  const preloadedAnswers: PreloadedAnswer[] = (
    await Promise.all(
      latestAnswers.map(async (answer) => {
        const { amountOfAnswers, newestValueDate, values } = await getAnswers({
          question_id: answer.isAnswering?.question_id || '',
          aboutThing_id: (getFirstValue(answer.context) as any)?.aboutThing
            ?.thing_id, // TODO fix type
        })

        return {
          answer,
          amountOfAnswers,
          newestValueDate,
          values,
        } as PreloadedAnswer
      })
    )
  ).filter(Boolean)

  return (
    <>
      <Headline type="h2">
        <TS keys="Answers">Question you already answers</TS>
      </Headline>

      {Array.isArray(preloadedAnswers) && preloadedAnswers.length > 0 ? (
        preloadedAnswers
          .filter(Boolean)
          .map((answerData) => (
            <AnswerChart
              key={answerData.answer.answer_id}
              answer={answerData.answer}
              amountOfAnswers={answerData.amountOfAnswers}
              newestValueDate={answerData.newestValueDate}
              values={answerData.values}
            />
          ))
      ) : (
        <P>
          <TS keys="Answers">Answer questions to see what others think!</TS>
        </P>
      )}
    </>
  )
}
