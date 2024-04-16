import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { QuestionCard } from '@/components/client/QuestionCard'
import { getQuestion } from '@/lib/getQuestion'
import { getRandomQuestion } from '@/lib/getRandomQuestion'
import { getRandomThing } from '@/lib/getRandomThing'

export default async function NextQuestion({
  question_id,
}: {
  question_id?: string
}) {
  let question = null
  if (question_id) {
    question = await getQuestion({
      where: {
        question_id,
      },
    })
  } else {
    question = await getRandomQuestion()
  }
  let aboutThing = null

  if (!question) {
    if (question_id) {
      return (
        <P className="text-center">
          <strong>Thanks for already answering this question!</strong>
          <br />
          Every question can be answered only once every 12 month.
        </P>
      )
    } else {
      return (
        <P className="text-center">
          <strong>
            There are no questions available to answer at the moment.
          </strong>
          <br />
          Every question can be answered only once every 12 month.
          <br />
          Check back later when we’ve added more questions.
        </P>
      )
    }
  }

  if (question.aboutThingTypes && question.aboutThingTypes.length > 0) {
    aboutThing = await getRandomThing({
      where: {
        type: {
          in: question.aboutThingTypes,
        },
      },
    })

    if (!aboutThing) {
      return (
        <P className="text-center">
          <strong>
            There are no questions available to answer at the moment.
          </strong>
          <br />
          Every question can be answered only once every 12 month.
          <br />
          Check back later when we’ve added more questions.
        </P>
      )
    }
  }

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
        Answer the question to know what others think…
      </Headline>
      <QuestionCard question={question} aboutThing={aboutThing ?? undefined} />
    </section>
  )
}
