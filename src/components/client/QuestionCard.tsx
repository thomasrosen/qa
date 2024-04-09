'use client'

import { saveAnswer } from '@/actions/saveAnswer'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Combobox } from '@/components/client/Combobox'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  QuestionSchemaType,
  ThingSchemaType,
  ValueSchemaType,
} from '@/lib/prisma'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

type AnswerButtonsProps = {
  question: QuestionSchemaType
  answer: (value: { value: ValueSchemaType }) => void
}
function AnswerButtons({ question, answer }: AnswerButtonsProps) {
  const [thingValue, setThingValue] = useState<string[]>([])
  const [thingOptions, setThingOptions] = useState<ThingSchemaType[]>([])

  const [inputValue, setInputValue] = useState('')
  const onInputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const answerType: string = question.answerType || ''

  const fetchThingOptions = useCallback(() => {
    const answerThingTypes: string[] = question.answerThingTypes || []

    async function fetchOptions() {
      if (answerThingTypes.length === 0) {
        // set things to an empty array if no types are selected
        setThingOptions([])
        return
      }

      const url = new URL('/api/thingOptions', window.location.href)
      for (const type of answerThingTypes) {
        url.searchParams.append('t', type)
      }

      const response = await fetch(url.href)
      const { things } = await response.json()
      setThingOptions(things)
    }

    if (
      answerType === 'Thing' &&
      answerThingTypes.length > 0 &&
      (!question.answerThingOptions ||
        (question.answerThingOptions &&
          question.answerThingOptions.length === 0))
    ) {
      fetchOptions()
    }
  }, [question.answerThingTypes, question.answerThingOptions, answerType])

  useEffect(() => {
    fetchThingOptions()
  }, [fetchThingOptions])

  if (question.answerType === 'Boolean') {
    return (
      <div className="flex gap-4 w-full">
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
      </div>
    )
  }

  if (question.answerType === 'String') {
    return (
      <div className="flex gap-4 flex-col w-full">
        <Input
          type="text"
          placeholder="Type your answer here"
          value={inputValue}
          onChange={onInputChangeHandler}
        />
        <Button
          variant="default"
          className="w-full"
          onClick={() =>
            answer({
              value: {
                valueType: 'String',
                valueAsString: inputValue,
                valueAsNumber: null,
                valueAsBoolean: null,
                valueAsThing_id: null,
              },
            })
          }
        >
          Submit Answer
        </Button>
      </div>
    )
  }

  if (question.answerType === 'Number') {
    return (
      <div className="flex gap-4 flex-col w-full">
        <Input
          type="number"
          placeholder="Type your answer as a Number here"
          value={inputValue}
          onChange={onInputChangeHandler}
        />
        <Button
          variant="default"
          className="w-full"
          onClick={() =>
            answer({
              value: {
                valueType: 'Number',
                valueAsString: null,
                valueAsNumber: Number(inputValue),
                valueAsBoolean: null,
                valueAsThing_id: null,
              },
            })
          }
        >
          Submit Answer
        </Button>
      </div>
    )
  }

  if (question.answerType === 'Thing') {
    const hasThingOptions = Array.isArray(question.answerThingOptions)
    const cutoff = 5

    let input: React.JSX.Element[] | React.JSX.Element = <P>loading...</P>
    if (
      hasThingOptions &&
      question.answerThingOptions &&
      question.answerThingOptions.length > 0 &&
      question.answerThingOptions.length <= cutoff
    ) {
      input = question.answerThingOptions?.map((thing, i) => (
        <Button
          key={`${i}-${thing.thing_id}`}
          variant="outline"
          className="w-full h-auto"
          onClick={() =>
            answer({
              value: {
                valueType: 'Thing',
                valueAsString: null,
                valueAsNumber: null,
                valueAsBoolean: null,
                valueAsThing_id: thing.thing_id,
              },
            })
          }
        >
          <ThingRow thing={thing} className="text-inherit bg-inherit" />
        </Button>
      ))
    } else if (
      hasThingOptions &&
      question.answerThingOptions &&
      (question.answerThingOptions.length === 0 ||
        question.answerThingOptions.length > cutoff)
    ) {
      input = (
        <>
          <Combobox
            selected={thingValue.filter(Boolean)}
            options={question.answerThingOptions.map((option) => ({
              value: option.thing_id || '', // should always be set. just to make types happy
              keywords: [option.name, option.type, option.thing_id] as string[],
              data: option,
            }))}
            renderLabel={(option) => <ThingRow thing={option.data} />}
            multiple={false}
            onChange={(values) => setThingValue(values)}
          />

          <Button
            disabled={thingValue.length === 0}
            variant="default"
            className="w-full"
            onClick={() => {
              if (thingValue.length > 0) {
                answer({
                  value: {
                    valueType: 'Thing',
                    valueAsString: null,
                    valueAsNumber: null,
                    valueAsBoolean: null,
                    valueAsThing_id: thingValue[0],
                  },
                })
              }
            }}
          >
            Submit Answer
          </Button>
        </>
      )
    } else if (!hasThingOptions) {
      // all things that are as options
      input = (
        <>
          {thingOptions.length > 0 && (
            <Combobox
              selected={thingValue.filter(Boolean)}
              options={thingOptions.map((option) => ({
                value: option.thing_id || '', // should always be set. just to make types happy
                keywords: [
                  option.name,
                  option.type,
                  option.thing_id,
                ] as string[],
                data: option,
              }))}
              renderLabel={(option) => <ThingRow thing={option.data} />}
              multiple={false}
              onChange={(values) => setThingValue(values)}
            />
          )}

          <Button
            disabled={thingValue.length === 0}
            variant="default"
            className="w-full"
            onClick={() => {
              if (thingValue.length > 0) {
                answer({
                  value: {
                    valueType: 'Thing',
                    valueAsString: null,
                    valueAsNumber: null,
                    valueAsBoolean: null,
                    valueAsThing_id: thingValue[0],
                  },
                })
              }
            }}
          >
            Submit Answer
          </Button>
        </>
      )
    }

    return <div className="flex gap-4 flex-col w-full">{input}</div>
  }

  return null
}

export function QuestionCard({
  question,
  aboutThing,
}: {
  question: QuestionSchemaType
  aboutThing?: ThingSchemaType
}) {
  const [isLoading, setIsLoading] = useState(false)

  const answer = useCallback(
    async ({ value }: { value: ValueSchemaType }) => {
      setIsLoading(true)

      // don't await the function, to be faster. saving to the db takes about 1-2 seconds. thats too long of a wait time.
      ;(async () => {
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
      })()

      window.location.reload()
    },
    [question.question_id, aboutThing]
  )

  const skip = useCallback(() => {
    setIsLoading(true)
    window.location.reload()
  }, [])

  return (
    <React.Fragment key={question.question_id}>
      <Headline type="h2" className="border-0 opacity-30">
        Answer the question to know what others think…
      </Headline>
      <Card>
        {question && (
          <CardHeader>
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
          <P type="muted" className="text-center">
            Loading…
          </P>
        )}
      </Card>
      <div className="flex justify-between">
        <nav className="text-white flex">
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest_thing" className="no-underline">
              Suggest a Thing
            </Link>
          </Button>
          <Separator orientation="vertical" className="my-2 h-auto" />
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
