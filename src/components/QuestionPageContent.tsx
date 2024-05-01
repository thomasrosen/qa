import { Headline } from '@/components/Headline'
import { QuestionCard } from '@/components/client/QuestionCard'
import { PreloadedAnswer } from '@/lib/types'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { AnswerChart } from './AnswerChart'
import { Button } from './ui/button'

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
        <section className="flex flex-col gap-4 mb-4 place-content-center">
          <div className="mb-2 mt-8 flex justify-between items-center gap-4">
            <Headline type="h2" className="border-0 p-0 m-0">
              <TC keys="answerChartWrapper">
                {question_id
                  ? 'Ergebnisse für diese Frage'
                  : 'Ergebnisse zu deiner letzte Antwort'}
              </TC>
            </Headline>
            <Link href="/answers">
              <Button variant="outline">
                <TC keys="answerChartWrapper">Alle Antworten</TC>
              </Button>
            </Link>
          </div>
          {Array.isArray(preloadedAnswers) &&
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
              ))}
        </section>
      )}
    </>
  )
}
