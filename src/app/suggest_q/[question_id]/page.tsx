import { Headline } from '@/components/Headline'
import { getQuestion } from '@/lib/getQuestion'
import { InputForm } from '../page'

export default async function SuggestQuestion({
  params: { question_id },
}: {
  params: { question_id: string }
}) {
  const question = await getQuestion({
    where: {
      question_id,
    },
  })

  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">Edit the Question</Headline>
      <InputForm question={question} />
    </section>
  )
}
