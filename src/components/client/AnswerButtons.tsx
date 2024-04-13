'use client'

import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Combobox } from '@/components/client/Combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  QuestionSchemaType,
  ThingSchemaType,
  ValueSchemaType,
} from '@/lib/prisma'
import React, { useCallback, useEffect, useState } from 'react'

type AnswerButtonsProps = {
  question: QuestionSchemaType
  answer: (value: { value: ValueSchemaType }) => void
}
export function AnswerButtons({ question, answer }: AnswerButtonsProps) {
  const [thingValue, setThingValue] = useState<string[]>([])
  const [thingOptions, setThingOptions] = useState<ThingSchemaType[]>([])

  const [inputValue, setInputValue] = useState<string>('')
  const onInputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const [stringValue, setStringValue] = useState<string[]>([])
  const onStringInputChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStringValue([e.target.value])
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

  // if (question.answerType === 'String') {
  //   return (
  //     <div className="flex gap-4 flex-col w-full">
  //       <Input
  //         type="text"
  //         placeholder="Type your answer here"
  //         value={inputValue}
  //         onChange={onInputChangeHandler}
  //       />
  //       <Button
  //         variant="default"
  //         className="w-full"
  //         onClick={() =>
  //           answer({
  //             value: {
  //               valueType: 'String',
  //               valueAsString: inputValue,
  //               valueAsNumber: null,
  //               valueAsBoolean: null,
  //               valueAsThing_id: null,
  //             },
  //           })
  //         }
  //       >
  //         Submit Answer
  //       </Button>
  //     </div>
  //   )
  // }

  if (question.answerType === 'String') {
    const hasOptions = Array.isArray(question.answerStringOptions)
    const cutoff = 5

    let input: React.JSX.Element[] | React.JSX.Element = <P>loading...</P>
    if (
      hasOptions &&
      question.answerStringOptions &&
      question.answerStringOptions.length > 0 &&
      question.answerStringOptions.length <= cutoff
    ) {
      input = question.answerStringOptions?.map((string, i) => (
        <Button
          key={`${i}-${string}`}
          variant="outline"
          className="w-full h-auto"
          onClick={() =>
            answer({
              value: {
                valueType: 'String',
                valueAsString: string,
                valueAsNumber: null,
                valueAsBoolean: null,
                valueAsThing_id: null,
              },
            })
          }
        >
          {string}
        </Button>
      ))
    } else if (
      hasOptions &&
      question.answerStringOptions &&
      (question.answerStringOptions.length === 0 ||
        question.answerStringOptions.length > cutoff)
    ) {
      input = (
        <>
          <Combobox
            selected={stringValue.filter(Boolean)}
            options={question.answerStringOptions.map((string) => ({
              value: string || '',
            }))}
            renderLabel={(option) => option.value}
            multiple={false}
            onChange={(values) => setStringValue(values)}
            allowCustom={question.allowCreateNewOption}
            placeholder={
              question.allowCreateNewOption
                ? 'Select or type your answer…'
                : undefined
            }
          />

          <Button
            disabled={stringValue.length === 0}
            variant="default"
            className="w-full"
            onClick={() => {
              if (stringValue.length > 0) {
                answer({
                  value: {
                    valueType: 'String',
                    valueAsString: stringValue[0],
                    valueAsNumber: null,
                    valueAsBoolean: null,
                    valueAsThing_id: null,
                  },
                })
              }
            }}
          >
            Submit Answer
          </Button>
        </>
      )
    } else if (!hasOptions) {
      // all things that are as options
      input = (
        <>
          <Input
            type="text"
            placeholder="Type your answer here"
            value={stringValue?.[0] || ''}
            onChange={onStringInputChangeHandler}
          />

          <Button
            disabled={stringValue.length === 0}
            variant="default"
            className="w-full"
            onClick={() => {
              if (stringValue.length > 0) {
                answer({
                  value: {
                    valueType: 'String',
                    valueAsString: stringValue[0],
                    valueAsNumber: null,
                    valueAsBoolean: null,
                    valueAsThing_id: null,
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
    const hasOptions = Array.isArray(question.answerThingOptions)
    const cutoff = 5

    let input: React.JSX.Element[] | React.JSX.Element = <P>loading...</P>
    if (
      hasOptions &&
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
      hasOptions &&
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
    } else if (!hasOptions) {
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
