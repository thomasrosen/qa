'use client'

import { saveAnswer } from '@/actions/saveAnswer'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { AnswerButtons } from '@/components/client/AnswerButtons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  QuestionSchemaType,
  ThingSchemaType,
  ValueSchemaType,
} from '@/lib/prisma'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'

export function QuestionCard({
  question,
  aboutThing,
}: {
  question: QuestionSchemaType
  aboutThing?: ThingSchemaType
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const answer = useCallback(
    async ({ value }: { value: ValueSchemaType }) => {
      setIsLoading(true)

      await saveAnswer({
        isAnswering_id: question.question_id,
        values: [value],
        context: [
          {
            time: new Date(),
            aboutThing_id: aboutThing ? aboutThing.thing_id : null,
          },
        ],
      })

      router.refresh()
      setIsLoading(false)
    },
    [question.question_id, aboutThing, router]
  )

  const skip = useCallback(() => {
    setIsLoading(true)
    window.location.reload()
  }, [])

  const tags = question.tags || []

  return (
    <React.Fragment key={question.question_id}>
      <Card>
        {question && (
          <CardHeader>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-4 -mt-1 justify-center">
                {tags.map((thing) => (
                  <ThingRow
                    key={thing.thing_id}
                    thing={thing}
                    className="w-auto inline-block p-0"
                  />
                ))}
              </div>
            )}
            {question.question && (
              <CardTitle className="text-center">{question.question}</CardTitle>
            )}
            {question.description && (
              <CardDescription className="text-center">
                {question.description}
              </CardDescription>
            )}
          </CardHeader>
        )}

        {aboutThing && (
          <CardContent className="text-center">
            <P className="mb-0">{aboutThing.name}</P>
          </CardContent>
        )}

        <CardFooter
          className={isLoading ? 'pointer-events-none' : 'pointer-events-auto'}
        >
          <AnswerButtons question={question} answer={answer} />
        </CardFooter>
        {isLoading && (
          <P type="ghost" className="text-center">
            Loading…
          </P>
        )}
      </Card>
      <div className="flex justify-between">
        <nav className="text-white flex">
          {/*
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest_thing" className="no-underline">
              Suggest a Thing
            </Link>
          </Button>
          <Separator orientation="vertical" className="my-2 h-auto" />
          */}
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest_q" className="no-underline">
              Suggest a Question
            </Link>
          </Button>
        </nav>
        <Button variant="outline" onClick={skip}>
          Skip
        </Button>
      </div>
    </React.Fragment>
  )
}
