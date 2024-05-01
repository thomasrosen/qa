'use client'

import { preloadAnswersForQuestion } from '@/actions/preloadAnswersForQuestion'
import { preloadQuestion } from '@/actions/preloadQuestion'
import { Headline } from '@/components/Headline'
import { QuestionCard } from '@/components/client/QuestionCard'
import { PreloadedAnswer } from '@/lib/types'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const preloadedQuestionCache = useRef(preloadedQuestion)
  const preloadedAnswersCache = useRef(preloadedAnswers)

  const [question, setQuestion] = useState(preloadedQuestion)
  const [answers, setAnswers] = useState(preloadedAnswers)

  const aboutThing = preloadedAboutThing

  const preloadNext = useCallback(async () => {
    console.log('preloadedQuestionCache-1', preloadedQuestionCache.current)
    console.log('preloadedAnswersCache-1', preloadedAnswersCache.current)

    preloadedAnswersCache.current = await preloadAnswersForQuestion(
      preloadedQuestionCache.current.question_id
    )
    preloadedQuestionCache.current = await preloadQuestion()

    console.log('preloadedQuestionCache-2', preloadedQuestionCache.current)
    console.log('preloadedAnswersCache-2', preloadedAnswersCache.current)
  }, [])

  useEffect(() => {
    console.log('useEffect')
    if (preloadNext) {
      preloadNext()
    }
  }, [preloadNext])

  const showNext = useCallback(async () => {
    console.log('showNext', showNext)
    setQuestion(preloadedQuestionCache.current)
    setAnswers(preloadedAnswersCache.current)
  }, [])

  const questionNeedsAboutThing =
    question && question.aboutThingTypes && question.aboutThingTypes.length > 0

  const answerIsForPreloadedQuestion = question_id === question.question_id

  return (
    <>
      {!question || (questionNeedsAboutThing && !aboutThing) ? (
        noQuestionsFallback
      ) : (
        <section className="flex flex-col gap-4 mb-4 place-content-center">
          <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
            <TC keys="NextQuestion">
              Beantworte die Frage, um zu erfahren, was andere denken…
            </TC>
          </Headline>
          <QuestionCard
            key={question.question_id}
            question={question}
            aboutThing={aboutThing ?? undefined}
            preloadNext={preloadNext}
            showNext={showNext}
          />
        </section>
      )}

      {answers && Array.isArray(answers) && (
        <section className="flex flex-col gap-4 mb-4 place-content-center">
          <div className="mb-2 mt-8 flex justify-between items-center gap-4">
            <Headline type="h2" className="border-0 p-0 m-0">
              <TC
                keys="answerChartWrapper"
                key={String(answerIsForPreloadedQuestion)}
              >
                {answerIsForPreloadedQuestion
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
          {answers.filter(Boolean).map((answerData) => (
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
