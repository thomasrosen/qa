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
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function QuestionCard({
  question,
  aboutThing,
  preloadNext,
  showNext,
}: {
  question: QuestionSchemaType
  aboutThing?: ThingSchemaType
  preloadNext: () => void
  showNext: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const answer = useCallback(
    async ({ value }: { value: ValueSchemaType }) => {
      showNext()
      preloadNext()

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
    [showNext, preloadNext, question.question_id, aboutThing]
  )

  const skip = useCallback(() => {
    setIsLoading(true)
    window.location.reload()
  }, [])

  const tags = question.tags || []

  return (
    <>
      <Card>
        {question && (
          <CardHeader>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-4 -mt-1 justify-start">
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
              <CardDescription className="text-start">
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
    </>
  )
}
