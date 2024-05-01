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
import { P } from './P'
import { Button } from './ui/button'

export function QuestionPageContent({
  question_id,
  preloadedQuestion,
  preloadedAboutThing,
  preloadedAnswers = [],
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
  const [hasPreloadedQuestion, setHasPreloadedQuestion] = useState(
    !!preloadedQuestion
  )

  const aboutThing = preloadedAboutThing

  const preloadNext = useCallback(async () => {
    preloadedAnswersCache.current = await preloadAnswersForQuestion(
      preloadedQuestionCache.current?.question_id || undefined
    )
    preloadedQuestionCache.current = await preloadQuestion()
    setHasPreloadedQuestion(!!preloadedQuestionCache.current)
  }, [])

  useEffect(() => {
    if (preloadNext) {
      preloadNext()
    }
  }, [preloadNext])

  const showNext = useCallback(async () => {
    const nextQuestionId = preloadedQuestionCache.current?.question_id || ''

    setQuestion(preloadedQuestionCache.current)
    setAnswers(preloadedAnswersCache.current)
    preloadNext()

    if (window) {
      if (nextQuestionId) {
        window.history.pushState(null, '', `/q/${nextQuestionId}`)
      } else {
        window.history.pushState(null, '', '/q')
      }
    }
  }, [preloadNext])

  const questionNeedsAboutThing =
    question && question.aboutThingTypes && question.aboutThingTypes.length > 0

  const answerIsForPreloadedQuestion =
    (question_id && !question) ||
    (question && question_id === question.question_id)

  const displayQuestion =
    question &&
    (!questionNeedsAboutThing || (questionNeedsAboutThing && aboutThing))

  const hasAnswers = answers && Array.isArray(answers) && answers.length > 0

  if (!displayQuestion && !hasAnswers) {
    return (
      <section className="flex flex-col gap-4 mb-4 place-content-center">
        <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
          <TC keys="NextQuestion">
            Wir konnten zu der URL leider keine Frage finden.
          </TC>
        </Headline>
        <Link href="/q">
          <Button>Beantworte eine andere Frage</Button>
        </Link>
      </section>
    )
  }
  return (
    <>
      {displayQuestion && (
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
            showNext={showNext}
          />
        </section>
      )}

      {!displayQuestion && !answerIsForPreloadedQuestion && noQuestionsFallback}

      {hasAnswers && (
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
          {answerIsForPreloadedQuestion && displayQuestion ? (
            <P>Die Antwort siehst du nachdem beantworten.</P>
          ) : (
            answers
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
          )}
        </section>
      )}

      {!displayQuestion &&
        answerIsForPreloadedQuestion &&
        hasPreloadedQuestion && (
          <div className="flex flex-row justify-center mt-8">
            <Button onClick={showNext}>Nächste Frage beantworten</Button>
          </div>
        )}
    </>
  )
}
