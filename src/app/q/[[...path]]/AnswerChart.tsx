import { P } from '@/components/P'
import { BarChart } from '@/components/charts/BarChart'
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
import { devNull } from 'os'
import { Suspense } from 'react'

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
    isAbout_id: answer.isAbout?.thing_id,
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

  const aboutThing = answer.isAbout

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>Results for…</CardDescription>
          <CardTitle>{answer.isAnswering.question}</CardTitle>
          {aboutThing && <P className='mb-0'>{aboutThing.name}</P>}
        </CardHeader>

        <CardContent className='flex flex-col gap-4'>
          {values.length === 0 ? (
            <P className='mb-0'>
              You are the first to answer this question. Tell others to also
              answer questions, so we can graph you the answer as a nice chart.
            </P>
          ) : (
            <>
              <div className='h-96'>
                <Suspense fallback={<P>Loading chart...</P>}>
                  <BarChart
                    data={data}
                    tickValues={data.map((d) => d.value)}
                    ariaLabel='Bar Chart'
                    indexBy='label'
                  />
                </Suspense>
              </div>
              <P type='muted' className='mb-0'>
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
              </P>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
