import { HideFromTranslation } from '@/components/HideFromTranslation'
import { P } from '@/components/P'
import { ScreenshotElement } from '@/components/client/ScreenshotElement'
import { BarChart } from '@/components/client/charts/BarChart'
import { ScatterPlot } from '@/components/client/charts/ScatterPlot'
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
import { TS, tServer } from '@/translate/components/TServer'
import { CameraIcon } from '@radix-ui/react-icons'
import { devNull } from 'os'
import { Suspense } from 'react'

async function getTranslatedLabel(
  value: ExtendedValueSchemaType
): Promise<string> {
  let label = 'Unknown'
  if (value.valueType === 'Number') {
    return String(value.valueAsNumber) // numbers don't need translation (maybe when they are formatted)
  } else if (value.valueType === 'String' && value.valueAsString) {
    label = value.valueAsString
  } else if (value.valueType === 'Boolean') {
    label = value.valueAsBoolean ? 'Yes' : 'No'
  } else if (value.valueType === 'Thing') {
    label = value.valueAsThing.name
  }
  return (await tServer({ keys: 'AnswerChart', text: label })) || ''
}

function getFirstValue(value: any[] | undefined) {
  if (!value || value.length === 0 || !Array.isArray(value)) {
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
  const typedValues: ExtendedValueSchemaType[] = values

  let barChartData: {
    label: string
    value: number
    [key: string]: unknown
  }[] = []
  let scatterPlotData: {
    label: string
    x: number
    y: number
    [key: string]: unknown
  }[] = []

  const hasValues = values.length > 0
  let valueType = undefined

  if (hasValues) {
    const firstValue: ExtendedValueSchemaType = getFirstValue(typedValues)
    valueType = firstValue?.valueType

    if (values.length > 0) {
      if (valueType === 'Number') {
        scatterPlotData = await Promise.all(
          values.map(async (value, index) => ({
            label: await getTranslatedLabel(value),
            // x: value._count._all,
            y: 0,
            x: value.valueAsNumber ?? 0,
            z: value._count._all ?? 1,
            valueAsNumber: value.valueAsNumber ?? 0,
          }))
        )
      } else {
        barChartData = await Promise.all(
          values.map(async (value, index) => ({
            label: await getTranslatedLabel(value),
            value: value._count._all,
            valueAsThing: value.valueAsThing,
          }))
        )
      }
    }
  }

  const aboutThing = (getFirstValue(answer.context) as any)?.aboutThing // TODO fix type

  const randomScreenshotId = Math.random().toString(36).substring(7)

  return (
    <div id={randomScreenshotId} className="p-2 -m-2 bg-background">
      <Card className="aspect-square flex flex-col relative">
        <CardHeader>
          <CardDescription className="p-0 m-0">
            <TS keys="answerChart">Results for…</TS>
          </CardDescription>
          <CardTitle className="p-0 m-0">
            <TS keys="answerChart">{answer.isAnswering.question}</TS>
          </CardTitle>
          {aboutThing && (
            <P className="mb-0">
              <TS keys="answerChart">{aboutThing.name}</TS>
            </P>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-2 grow">
          {!hasValues ? (
            <P className="mb-0">
              <TS keys="answerChart">
                You are the first to answer this question. Tell others to also
                answer questions, so we can graph you the answer as a nice
                chart.
              </TS>
            </P>
          ) : (
            <>
              <div className="grow min-h-32">
                <Suspense
                  fallback={
                    <P>
                      <TS keys="answerChart">Loading chart…</TS>
                    </P>
                  }
                >
                  {valueType === 'Number' ? (
                    <ScatterPlot
                      data={scatterPlotData}
                      ariaLabel="Scatter Plot"
                      indexBy="label"
                    />
                  ) : (
                    <BarChart
                      data={barChartData}
                      tickValues={barChartData.map((d) => d.value)}
                      ariaLabel="Bar Chart"
                      indexBy="label"
                    />
                  )}
                </Suspense>
              </div>
              <P type="ghost" className="mb-0">
                <TS keys="answerChart">
                  This is what people have answered before{' '}
                  <HideFromTranslation
                    real={
                      newestValueDate
                        ? new Intl.DateTimeFormat(DEFAULT_LOCALE, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                          }).format(newestValueDate)
                        : devNull
                    }
                  >
                    April 19, 2024 at 5:11 PM
                  </HideFromTranslation>
                  .
                </TS>
                <br />
                <TS keys="answerChart">
                  Amount of answers:{' '}
                  <HideFromTranslation real={amountOfAnswers}>
                    123
                  </HideFromTranslation>
                </TS>
                <br />
                <TS keys="answerChart">
                  Collected at{' '}
                  <a href="https://qa.thomasrosen.me/" className="no-underline">
                    qa.thomasrosen.me
                  </a>
                </TS>
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
