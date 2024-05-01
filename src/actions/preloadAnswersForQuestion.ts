'use server'

import { auth } from '@/lib/auth'
import { getAnswers } from '@/lib/getAnswers'
import { getFirstValue } from '@/lib/getFirstValue'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { isSignedIn } from '@/lib/isSignedIn'
import { AnswerType, PreloadedAnswer } from '@/lib/types'

export async function preloadAnswersForQuestion(
  question_id?: string
): Promise<PreloadedAnswer[]> {
  // preload latest answers
  let latestAnswers: AnswerType[] = []
  if (question_id) {
    latestAnswers = await getLatestAnswers({
      take: 1,
      where: { isAnswering_id: question_id },
    })
  } else {
    // check if logged in
    const session = await auth()
    if (isSignedIn(session)) {
      // @ts-ignore already checked with isSignedOut()
      const user_id = session.user.id

      latestAnswers = await getLatestAnswers({
        where: { createdBy_id: user_id },
        take: 1,
      })
    }
  }

  const preloadedAnswer: PreloadedAnswer[] = (
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

  return preloadedAnswer
}
