import { P } from '@/components/P'
import { BarChart } from '@/components/client/BarChart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DEFAULT_LOCALE } from '@/lib/constants'
import { getAnswers } from '@/lib/getAnswers'
import { AnswerType, ExtendedValueSchemaType } from '@/lib/prisma'
import { CameraIcon } from '@radix-ui/react-icons'
import { devNull } from 'os'
import { Suspense } from 'react'
import { ScreenshotElement } from './client/ScreenshotElement'

function getLabel(value: ExtendedValueSchemaType) {
  if (value.valueType === 'String') {
    return value.valueAsString
  }
  if (value.valueType === 'Number') {
    return value.valueAsNumber
  }
  if (value.valueType === 'Boolean') {
    return value.valueAsBoolean ? 'Yes' : 'No'
  }
  if (value.valueType === 'Thing') {
    return value.valueAsThing.name
  }
  return 'Unknown'
}

function getFirstValue(value: unknown[] | undefined): unknown {
  if (!value || value.length === 0) {
    return undefined
  }
  return value[0]
}

export async function AnswerChart({ answer }: { answer?: AnswerType | null }) {
  if (!answer) {
    return null
  }
  if (!answer.isAnswering) {
    return null
  }
  if (!answer.isAnswering.question_id) {
    return null
  }

  const { amountOfAnswers, newestValueDate, values } = await getAnswers({
    question_id: answer.isAnswering.question_id,
    aboutThing_id: (getFirstValue(answer.context) as any)?.aboutThing?.thing_id, // TODO fix type
  })

  let data: {
    label: string
    value: number
    [key: string]: unknown
  }[] = []
  if (values.length > 0) {
    data = values.map((value, index) => ({
      label: getLabel(value),
      value: value._count._all,
      valueAsThing: value.valueAsThing,
    }))
  }

  const aboutThing = (getFirstValue(answer.context) as any)?.aboutThing // TODO fix type

  const randomScreenshotId = Math.random().toString(36).substring(7)

  return (
    <div id={randomScreenshotId} className="p-2 -m-2 bg-background">
      <Card className="aspect-square flex flex-col relative">
        <CardHeader>
          <CardDescription className="p-0 m-0">Results for…</CardDescription>
          <CardTitle className="p-0 m-0">
            {answer.isAnswering.question}
          </CardTitle>
          {aboutThing && <P className="mb-0">{aboutThing.name}</P>}
        </CardHeader>

        <CardContent className="flex flex-col gap-2 grow">
          {values.length === 0 ? (
            <P className="mb-0">
              You are the first to answer this question. Tell others to also
              answer questions, so we can graph you the answer as a nice chart.
            </P>
          ) : (
            <>
              <div className="grow min-h-32">
                <Suspense fallback={<P>Loading chart...</P>}>
                  <BarChart
                    data={data}
                    tickValues={data.map((d) => d.value)}
                    ariaLabel="Bar Chart"
                    indexBy="label"
                  />
                </Suspense>
              </div>
              <P type="ghost" className="mb-0">
                This is what people have answered before{' '}
                {newestValueDate
                  ? new Intl.DateTimeFormat(DEFAULT_LOCALE, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    }).format(newestValueDate)
                  : devNull}
                .
                <br />
                Amount of answers: {amountOfAnswers}
                <br />
                Collected at{' '}
                <a href="https://qa.thomasrosen.me/" className="no-underline">
                  qa.thomasrosen.me
                </a>
              </P>
            </>
          )}
        </CardContent>
        <ScreenshotElement
          htmlId={randomScreenshotId}
          className="absolute top-6 right-6 cursor-pointer hover:opacity-80"
        >
          <CameraIcon className="w-4 h-4" />
        </ScreenshotElement>
      </Card>
    </div>
  )
}
