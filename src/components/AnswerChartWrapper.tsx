import { AnswerType } from '@/lib/types'
import { TC } from '@/translate/components/client/TClient'
import Link from 'next/link'
import { AnswerChart } from './AnswerChart'
import { Headline } from './Headline'
import { Button } from './ui/button'

export type PreloadedAnswer = {
  answer: AnswerType
  amountOfAnswers: any
  newestValueDate: any
  values: any
}

export function AnswerChartWrapper({
  preloadedAnswers = [],
}: {
  preloadedAnswers?: PreloadedAnswer[]
}) {
  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <div className="mb-2 mt-8 flex justify-between items-center gap-4">
        <Headline type="h2" className="border-0 p-0 m-0">
          <TC keys="answerChartWrapper">Ergebnisse für diese Frage</TC>
        </Headline>
        <Link href="/answers">
          <Button variant="outline">
            <TC keys="answerChartWrapper">Alle Antworten</TC>
          </Button>
        </Link>
      </div>
      {Array.isArray(preloadedAnswers) &&
        preloadedAnswers
          .filter(Boolean)
          .map((answerData) => (
            <AnswerChart
              key={answerData.answer.answer_id}
              answer={answerData.answer}
              amountOfAnswers={answerData.amountOfAnswers}
              newestValueDate={answerData.newestValueDate}
              values={answerData.values}
            />
          ))}
    </section>
  )
}
