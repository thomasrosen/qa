'use client'

import { preloadAnswersForQuestion } from '@/actions/preloadAnswersForQuestion'
import { preloadQuestion } from '@/actions/preloadQuestion'
import { Headline } from '@/components/Headline'
import { QuestionCard } from '@/components/client/QuestionCard'
import { PreloadedAnswer } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnswerChart } from './AnswerChart'
import { LoadingSpinner } from './LoadingSpinner'
import { P } from './P'
import { Button } from './ui/button'

export function QuestionPageContent({
  embedded = false,
  question_id,
  preloadedQuestion,
  preloadedAboutThing,
  preloadedAnswers = [],
  noQuestionsFallback,
}: {
  embedded?: boolean
  question_id?: string
  preloadedQuestion?: any
  preloadedAboutThing?: any
  preloadedAnswers?: PreloadedAnswer[]
  noQuestionsFallback?: React.ReactNode
}) {
  const preloadedQuestionCache = useRef(preloadedQuestion)
  const preloadedAnswersCache = useRef(preloadedAnswers)

  const loadingNextRef = useRef(false)
  const showNextFunctionCache = useRef<(() => void) | undefined>(undefined)
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false)

  const [question, setQuestion] = useState(preloadedQuestion)
  const [answers, setAnswers] = useState(preloadedAnswers)
  const [hasPreloadedQuestion, setHasPreloadedQuestion] = useState(
    !!preloadedQuestion
  )

  const aboutThing = preloadedAboutThing

  const preloadNext = useCallback(async () => {
    if (loadingNextRef.current === false) {
      loadingNextRef.current = true

      preloadAnswersForQuestion(
        preloadedQuestionCache.current?.question_id || undefined
      )
        .then((newAnswers) => {
          preloadedAnswersCache.current = newAnswers
        })
        .catch((error) => {
          console.error('preloadAnswersForQuestion error', error)
        })

      preloadQuestion()
        .then((newQuestion) => {
          preloadedQuestionCache.current = newQuestion
          setHasPreloadedQuestion(!!preloadedQuestionCache.current)

          loadingNextRef.current = false
          if (typeof showNextFunctionCache.current === 'function') {
            showNextFunctionCache.current()
            showNextFunctionCache.current = undefined
          }
        })
        .catch((error) => {
          console.error('preloadQuestion error', error)
        })
    }
  }, [])

  useEffect(() => {
    if (preloadNext) {
      preloadNext()
    }
  }, [preloadNext])

  const showNext = useCallback(async () => {
    function showNextQuestion() {
      if (preloadedQuestionCache.current) {
        setQuestion(preloadedQuestionCache.current)
        preloadNext()

        const nextQuestionId = preloadedQuestionCache.current?.question_id || ''

        if (window) {
          if (nextQuestionId) {
            window.history.pushState(null, '', `/q/${nextQuestionId}`)
          } else {
            window.history.pushState(null, '', '/q')
          }
        }
      } else {
        setQuestion(undefined)
      }

      if (preloadedAnswersCache.current) {
        setAnswers(preloadedAnswersCache.current)
      } else {
        setAnswers(preloadedAnswersCache.current || [])
      }
      setIsLoadingNextQuestion(false)
    }

    if (loadingNextRef.current) {
      showNextFunctionCache.current = showNextQuestion
      setIsLoadingNextQuestion(true)
    } else {
      showNextQuestion()
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
      {isLoadingNextQuestion && (
        <div className="flex flex-col items-center pt-8">
          <LoadingSpinner className="h-16 w-16" />
          <P type="ghost" className="text-center">
            Lade nächste Frage…
          </P>
        </div>
      )}

      {displayQuestion && (
        <section
          className={cn(
            'flex flex-col gap-4 mb-4 place-content-center',
            isLoadingNextQuestion
              ? 'pointer-events-none'
              : 'pointer-events-auto'
          )}
        >
          <Headline type="h2" className="border-0 p-0 mb-2">
            <TC keys="NextQuestion">
              Beantworte die Frage, um zu erfahren, was andere denken…
            </TC>
          </Headline>
          <QuestionCard
            embedded={embedded}
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
