'use client'

import { saveAnswer } from '@/actions/saveAnswer'
import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ValueSchemaType } from '@/lib/prisma'
import Link from 'next/link'
import { useCallback } from 'react'

export function QuestionCard({ question, aboutThing }: { question: Question; aboutThing: Thing }) {
  const answer = useCallback(
    async ({ value }: { value: ValueSchemaType }) => {
      console.log('INFO_CiYX7QC2 value', value)

      const newAnswer = await saveAnswer({
        isAnswering_id: question.question_id,
        values: [value],
        isAbout_id: aboutThing.thing_id,
        isAnsweredByAgent_id: '',
      })

      console.log('INFO_k28cDJlN newAnswer', newAnswer)
    },
    [question, aboutThing]
  )

  return (
    <>
      <Card>
        {question && (
          <CardHeader>
            {question.question && (
              <CardTitle className="text-center">{question.question}</CardTitle>
            )}
            {question.description && (
              <CardDescription className="text-center">{question.description}</CardDescription>
            )}
          </CardHeader>
        )}

        {aboutThing && (
          <CardContent className="text-center">
            <P className="mb-0">{aboutThing.name}</P>
          </CardContent>
        )}

        {question.answerType === 'Boolean' ? (
          // answerThingTypes
          <CardFooter className="flex gap-4">
            <Button
              variant="default"
              className="w-full"
              onClick={() =>
                answer({
                  value: {
                    valueType: 'Boolean',
                    valueAsString: null,
                    valueAsNumber: null,
                    valueAsBoolean: true,
                    valueAsThing_id: null,
                  },
                })
              }
            >
              Yes
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() =>
                answer({
                  value: {
                    valueType: 'Boolean',
                    valueAsString: null,
                    valueAsNumber: null,
                    valueAsBoolean: false,
                    valueAsThing_id: null,
                  },
                })
              }
            >
              No
            </Button>
          </CardFooter>
        ) : null}
      </Card>
      <div className="flex justify-between">
        <nav className="text-white flex">
          {/*
          <Button variant="link" asChild className="z-10">
            <Link href="/suggestthing" className="no-underline">
              Suggest a Word
            </Link>
          </Button>
          <Separator orientation="vertical" className="my-2 h-auto" />
          */}
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest" className="no-underline">
              Suggest a Question
            </Link>
          </Button>
        </nav>
        <Button variant="outline">Skip</Button>
      </div>
    </>
  )
}
