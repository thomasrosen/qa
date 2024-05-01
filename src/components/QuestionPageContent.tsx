import { Headline } from '@/components/Headline'
import { QuestionCard } from '@/components/client/QuestionCard'
import { TC } from '@/translate/components/client/TClient'
import { AnswerChartWrapper, type PreloadedAnswer } from './AnswerChartWrapper'

export function QuestionPageContent({
  question_id,
  preloadedQuestion,
  preloadedAboutThing,
  preloadedAnswers,
  noQuestionsFallback,
}: {
  question_id?: string
  preloadedQuestion?: any
  preloadedAboutThing?: any
  preloadedAnswers?: PreloadedAnswer[]
  noQuestionsFallback?: React.ReactNode
}) {
  const question = preloadedQuestion
  const aboutThing = preloadedAboutThing

  const questionNeedsAboutThing =
    question && question.aboutThingTypes && question.aboutThingTypes.length > 0

  return (
    <>
      {!preloadedQuestion || (questionNeedsAboutThing && !aboutThing) ? (
        noQuestionsFallback
      ) : (
        <section className="flex flex-col gap-4 mb-4 place-content-center">
          <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
            <TC keys="NextQuestion">
              Beantworte die Frage, um zu erfahren, was andere denken…
            </TC>
          </Headline>
          <QuestionCard
            question={question}
            aboutThing={aboutThing ?? undefined}
          />
        </section>
      )}

      {preloadedAnswers && (
        <AnswerChartWrapper preloadedAnswers={preloadedAnswers} />
      )}
    </>
  )
}
