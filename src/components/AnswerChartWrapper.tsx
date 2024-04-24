import { getLatestAnswers } from '@/lib/getLatestAnswers'
import { AnswerType } from '@/lib/types'
import Link from 'next/link'
import { TS } from '../translate/components/TServer'
import { AnswerChart } from './AnswerChart'
import { Headline } from './Headline'
import { Button } from './ui/button'

export async function AnswerChartWrapper({
  question_id,
}: {
  question_id?: string
}) {
  let latestAnswers: AnswerType[] = []

  if (question_id) {
    latestAnswers = await getLatestAnswers({
      take: 1,
      where: { isAnswering_id: question_id },
    })
  } else {
    latestAnswers = await getLatestAnswers({ take: 1 })
  }

  if (latestAnswers.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <div className="mb-2 mt-8 flex justify-between items-center">
        <Headline type="h2" className="border-0 p-0 m-0">
          <TS keys="answerChartWrapper">Results for this question</TS>
        </Headline>
        <Link href="/answers">
          <Button variant="outline">
            <TS keys="answerChartWrapper">All Answers</TS>
          </Button>
        </Link>
      </div>
      {latestAnswers.filter(Boolean).map((latestAnswer) => (
        <AnswerChart key={latestAnswer.answer_id} answer={latestAnswer} />
      ))}
    </section>
  )
}
