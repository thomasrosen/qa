'use client'

import { preloadAnswersForQuestion } from '@/actions/preloadAnswersForQuestion'
import { preloadQuestion } from '@/actions/preloadQuestion'
import { AnswerChart } from '@/components/AnswerChart'
import { Headline } from '@/components/Headline'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { P } from '@/components/P'
import { QuestionCard } from '@/components/client/QuestionCard'
import { Button } from '@/components/ui/button'
import { PreloadedAnswer, QuestionSchemaType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const loadedQuestionIds = useRef<string[]>(
    preloadedQuestion ? [preloadedQuestion.question_id] : []
  )

  const nextQuestionCache = useRef<QuestionSchemaType | null>(null)
  const nextAnswersCache = useRef<PreloadedAnswer[]>([])

  const currentQuestionCache = useRef<QuestionSchemaType | null>(
    preloadedQuestion
  )
  const currentAnswersCache = useRef<PreloadedAnswer[]>(preloadedAnswers)

  const prevQuestionCache = useRef<QuestionSchemaType | null>(null)
  const prevAnswersCache = useRef<PreloadedAnswer[]>([])

  const loadingNextRef = useRef(false)
  const showNextFunctionCache = useRef<(() => void) | undefined>(undefined)
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false)

  const [question, setQuestion] = useState(preloadedQuestion)
  const [answers, setAnswers] = useState<PreloadedAnswer[]>(
    question_id && !preloadedQuestion && preloadedAnswers
      ? preloadedAnswers
      : []
  )

  const aboutThing = preloadedAboutThing

  const preloadNext = useCallback(async () => {
    if (loadingNextRef.current === false) {
      loadingNextRef.current = true

      // load question
      const nextQuestion = await preloadQuestion({
        not_question_id: loadedQuestionIds.current,
      })
      loadedQuestionIds.current = [
        ...(loadedQuestionIds.current || []),
        nextQuestion?.question_id || '',
      ].filter(Boolean)
      nextQuestionCache.current = nextQuestion
      // setHasPreloadedQuestion(!!nextQuestionCache.current)

      // load answers
      if (nextQuestion && nextQuestion?.question_id) {
        const nextAnswers = await preloadAnswersForQuestion(
          nextQuestion.question_id
        )
        nextAnswersCache.current = nextAnswers
      } else {
        nextAnswersCache.current = []
      }

      // loading finished
      loadingNextRef.current = false

      // set question if caught while loading
      if (typeof showNextFunctionCache.current === 'function') {
        showNextFunctionCache.current()
        showNextFunctionCache.current = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (question_id) {
      window.history.pushState(null, '', '/q')
    }
    if (preloadNext) {
      preloadNext()
    }
  }, [question_id, preloadNext])

  const showNext = useCallback(async () => {
    async function showNextQuestion() {
      setIsLoadingNextQuestion(false)

      // shift all caches
      prevQuestionCache.current = currentQuestionCache.current || null
      prevAnswersCache.current = currentAnswersCache.current || []

      currentQuestionCache.current = nextQuestionCache.current || null
      currentAnswersCache.current = nextAnswersCache.current || []

      nextQuestionCache.current = null // new values will be set in preloadNext
      nextAnswersCache.current = [] // new values will be set in preloadNext

      console.log('prevQuestionCache.current', prevQuestionCache.current)
      console.log('currentQuestionCache.current', currentQuestionCache.current)
      console.log('nextQuestionCache.current', nextQuestionCache.current)

      // set values that will be displayed
      setQuestion(currentQuestionCache.current)
      setAnswers(prevAnswersCache.current)

      // if (
      //   currentQuestionCache.current &&
      //   currentQuestionCache.current?.question_id &&
      //   window
      // ) {
      //   const currentQuestionId = currentQuestionCache.current?.question_id
      //   if (embedded === true) {
      //     window.history.pushState(null, '', `/embed/q/${currentQuestionId}`)
      //   } else {
      //     window.history.pushState(null, '', `/q/${currentQuestionId}`)
      //   }
      // }

      // get real values for nextQuestionCache and nextAnswersCache
      ;(async () => {
        await preloadNext()
      })()

      // if (window) {
      //   if (embedded === true) {
      //     window.history.pushState(null, '', `/embed/q`)
      //   } else {
      //     window.history.pushState(null, '', `/q`)
      //   }
      // }
    }

    if (loadingNextRef.current === true) {
      showNextFunctionCache.current = showNextQuestion
      setIsLoadingNextQuestion(true)
    } else {
      showNextQuestion()
    }
  }, [preloadNext])

  const answerIsForPreloadedQuestion =
    (question_id && !question) ||
    (question && question_id === question.question_id)

  const questionNeedsAboutThing =
    question && question.aboutThingTypes && question.aboutThingTypes.length > 0

  const displayQuestion =
    question &&
    (!questionNeedsAboutThing || (questionNeedsAboutThing && aboutThing))

  const hasAnswers = answers && Array.isArray(answers) && answers.length > 0

  if (!displayQuestion && !hasAnswers) {
    if (question_id) {
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
    } else {
      return noQuestionsFallback
    }
  }

  return (
    <>
      {isLoadingNextQuestion && (
        <div className="flex flex-col items-center pt-8 mb-8">
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
              ? 'pointer-events-none animate-pulse'
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
        <section
          className={cn(
            'flex flex-col gap-4 mb-4 place-content-center',
            !(answerIsForPreloadedQuestion && displayQuestion) && 'items-center'
          )}
        >
          <Headline type="h2" className="border-0 mt-8 p-0 mb-0">
            <TC
              keys="answerChartWrapper"
              key={String(answerIsForPreloadedQuestion)}
            >
              {answerIsForPreloadedQuestion
                ? 'Ergebnisse für diese Frage'
                : 'Ergebnisse zu deiner letzte Antwort'}
            </TC>
          </Headline>
          {answers.filter(Boolean).map((answerData) => (
            <AnswerChart
              key={answerData.answer.answer_id}
              answer={answerData.answer}
              amountOfAnswers={answerData.amountOfAnswers}
              newestValueDate={answerData.newestValueDate}
              values={answerData.values}
            />
          ))}
          <Link href="/answers">
            <Button variant="outline">
              <TC keys="answerChartWrapper">Alle Antworten</TC>
            </Button>
          </Link>
        </section>
      )}

      {!displayQuestion && answerIsForPreloadedQuestion && (
        <div className="flex flex-row justify-center mt-8">
          <Link href="/q">
            <Button>Nächste Frage beantworten</Button>
          </Link>
        </div>
      )}
    </>
  )
}
