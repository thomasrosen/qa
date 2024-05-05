import { preloadAnswersForQuestion } from '@/actions/preloadAnswersForQuestion'
import { preloadQuestion } from '@/actions/preloadQuestion'
import { NoQuestionsFallback } from '@/components/NoQuestionsFallback'
import { QuestionPageContent } from '@/components/client/QuestionPageContent'
import { auth } from '@/lib/auth'
import { getRandomThing } from '@/lib/getRandomThing'
import { isSignedOut } from '@/lib/isSignedIn'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'
import { signIn } from 'next-auth/react'

export const dynamic = 'force-dynamic'

export default async function EmbedQuestionsPage({
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
    await signIn('credentials', {})
  }

  // preload question
  const preloadedQuestion = await preloadQuestion({ question_id })

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
  const preloadedAnswer = question_id
    ? await preloadAnswersForQuestion(question_id)
    : []

  return (
    <TranslationStoreEntryPoint
      keys={['Questions', 'PreferredTagsChooser', 'Combobox']}
    >
      <QuestionPageContent
        embedded={true}
        question_id={question_id}
        preloadedQuestion={preloadedQuestion}
        preloadedAboutThing={preloadedAboutThing}
        preloadedAnswers={preloadedAnswer}
        noQuestionsFallback={<NoQuestionsFallback />}
      />
    </TranslationStoreEntryPoint>
  )
}
