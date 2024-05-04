'use client'

import { saveAnswer } from '@/actions/saveAnswer'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { AnswerButtons } from '@/components/client/AnswerButtons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  QuestionSchemaType,
  ThingSchemaType,
  ValueSchemaType,
} from '@/lib/prisma'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { useCallback } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Separator } from '../ui/separator'

export function QuestionCard({
  embedded = false,
  question,
  aboutThing,
  showNext,
}: {
  embedded?: boolean
  question: QuestionSchemaType
  aboutThing?: ThingSchemaType
  showNext: () => void
}) {
  const answer = useCallback(
    async ({ value }: { value: ValueSchemaType }) => {
      showNext()

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
    },
    [showNext, question.question_id, aboutThing]
  )

  const skip = useCallback(() => {
    showNext()
  }, [showNext])

  const tags = question.tags || []

  return (
    <>
      <Card>
        {question && (
          <CardHeader>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-0 -mt-1 justify-start">
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
              <CardTitle className="text-start">
                <TC>{question.question}</TC>
              </CardTitle>
            )}
            {question.description && (
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p(props) {
                    return <P type="ghost" className="mb-2" {...props} />
                  },
                  a(props) {
                    return (
                      <Link
                        {...props}
                        target="_blank"
                        href={props.href as string}
                      />
                    )
                  },
                }}
              >
                {question.description}
              </Markdown>
            )}
          </CardHeader>
        )}

        {aboutThing && (
          <CardContent className="text-center">
            <P className="mb-0">{aboutThing.name}</P>
          </CardContent>
        )}

        <CardFooter>
          <AnswerButtons question={question} answer={answer} />
        </CardFooter>
      </Card>
      <div className="flex justify-between">
        <nav className="text-white flex">
          {embedded && (
            <>
              <Button variant="link" asChild className="z-10">
                <Link href="/imprint" className="no-underline" target="_blank">
                  Impressum
                </Link>
              </Button>
              <Separator orientation="vertical" className="my-2 h-auto" />
            </>
          )}
          {/*
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest_thing" className="no-underline" target="_blank">
              Suggest a Thing
            </Link>
          </Button>
          <Separator orientation="vertical" className="my-2 h-auto" />
          */}
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest_q" className="no-underline" target="_blank">
              Frage vorschlagen
            </Link>
          </Button>
        </nav>
        <Button variant="outline" onClick={skip}>
          Überspringen
        </Button>
      </div>
    </>
  )
}
