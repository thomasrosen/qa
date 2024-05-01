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
import { getFirstValue } from '@/lib/getFirstValue'
import { AnswerType, ExtendedValueSchemaType } from '@/lib/prisma'
import { TC } from '@/translate/components/client/TClient'
import { CameraIcon } from '@radix-ui/react-icons'
import { devNull } from 'os'
import { Suspense } from 'react'

function getLabel(value: ExtendedValueSchemaType): string {
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

  return label || ''
  // return (await tServer({ keys: 'AnswerChart', text: label })) || ''
}

export function AnswerChart({
  answer,
  amountOfAnswers,
  newestValueDate,
  values,
}: {
  answer?: AnswerType | null
  amountOfAnswers: any
  newestValueDate: any
  values: any
}) {
  if (!answer) {
    return null
  }
  if (!answer.isAnswering) {
    return null
  }
  if (!answer.isAnswering.question_id) {
    return null
  }

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
        scatterPlotData = values.map((value: any) => ({
          label: getLabel(value),
          // x: value._count._all,
          y: 0,
          x: value.valueAsNumber ?? 0,
          z: value._count._all ?? 1,
          valueAsNumber: value.valueAsNumber ?? 0,
        }))
      } else {
        barChartData = values.map((value: any) => ({
          label: getLabel(value),
          value: value._count._all,
          valueAsThing: value.valueAsThing,
        }))
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
            <TC keys="answerChart">Ergebnisse für…</TC>
          </CardDescription>
          <CardTitle className="p-0 m-0">
            <TC keys="answerChart">{answer.isAnswering.question}</TC>
          </CardTitle>
          {aboutThing && (
            <P className="mb-0">
              <TC keys="answerChart">{aboutThing.name}</TC>
            </P>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-2 grow">
          {!hasValues ? (
            <P className="mb-0">
              <TC keys="answerChart">
                Du bist die erste Person, die diese Frage beantwortet hat. Bitte
                ermutige auch andere, Fragen zu beantworten, damit wir die
                Antworten in einem schönen Diagramm darstellen können.
              </TC>
            </P>
          ) : (
            <>
              <div className="grow min-h-32">
                {valueType === 'Number' ? (
                  <Suspense>
                    <ScatterPlot
                      data={scatterPlotData}
                      ariaLabel="Scatter Plot"
                      indexBy="label"
                    />
                  </Suspense>
                ) : (
                  <Suspense>
                    <BarChart
                      data={barChartData}
                      tickValues={barChartData.map((d) => d.value)}
                      ariaLabel="Bar Chart"
                      indexBy="label"
                    />
                  </Suspense>
                )}
              </div>
              <P type="ghost" className="mb-0">
                <TC keys="answerChart">
                  Das haben Personen vor dem{' '}
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
                    19. April 2024 um 17:11
                  </HideFromTranslation>{' '}
                  geantwortet.
                </TC>
                <br />
                <TC keys="answerChart">
                  Anzahl an Antworten:{' '}
                  <HideFromTranslation real={amountOfAnswers}>
                    123
                  </HideFromTranslation>
                </TC>
                <br />
                <TC keys="answerChart">
                  Gesammelt auf{' '}
                  <a href="https://qa.thomasrosen.me/" className="no-underline">
                    qa.thomasrosen.me
                  </a>
                </TC>
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
