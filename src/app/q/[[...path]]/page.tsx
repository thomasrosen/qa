import { PreloadedAnswer } from '@/components/AnswerChartWrapper'
import { QuestionPageContent } from '@/components/QuestionPageContent'
import { SignIn } from '@/components/client/SignIn'
import { auth } from '@/lib/auth'
import { getAnswers } from '@/lib/getAnswers'
import { getFirstValue } from '@/lib/getFirstValue'
import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { getQuestion } from '@/lib/getQuestion'
import { getRandomQuestion } from '@/lib/getRandomQuestion'
import { getRandomThing } from '@/lib/getRandomThing'
import { isSignedOut } from '@/lib/isSignedIn'
import { AnswerType } from '@/lib/types'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'

export const dynamic = 'force-dynamic'

export default async function QuestionsPage({
  params: { path },
}: {
  params: { path: string[] }
}) {
  let question_id: string | undefined = undefined
  if (Array.isArray(path)) {
    question_id = path[0]
  } else if (typeof path === 'string') {
    question_id = path
  }

  const session = await auth()
  if (isSignedOut(session)) {
    return <SignIn />
  }

  // preload question
  let preloadedQuestion = null
  if (question_id) {
    preloadedQuestion = await getQuestion({
      where: {
        question_id,
      },
    })
  } else {
    preloadedQuestion = await getRandomQuestion()
  }

  // preload aboutThing
  let preloadedAboutThing = null
  if (
    preloadedQuestion &&
    preloadedQuestion.aboutThingTypes &&
    preloadedQuestion.aboutThingTypes.length > 0
  ) {
    preloadedAboutThing = await getRandomThing({
      where: {
        type: {
          in: preloadedQuestion.aboutThingTypes,
        },
      },
    })
  }

  // preload latest answers
  let latestAnswers: AnswerType[] = []
  if (question_id) {
    latestAnswers = await getLatestAnswers({
      take: 1,
      where: { isAnswering_id: question_id },
    })
  } else {
    latestAnswers = await getLatestAnswers({ take: 1 })
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

  return (
    <TranslationStoreEntryPoint
      keys={['Questions', 'PreferredTagsChooser', 'Combobox']}
    >
      <QuestionPageContent
        question_id={question_id}
        preloadedQuestion={preloadedQuestion}
        preloadedAboutThing={preloadedAboutThing}
        preloadedAnswers={preloadedAnswer}
        noQuestionsFallback={null}
      />
    </TranslationStoreEntryPoint>
  )
}

// <NoQuestionsFallback />
