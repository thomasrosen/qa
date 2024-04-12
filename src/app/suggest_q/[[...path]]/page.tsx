import { Headline } from '@/components/Headline'
import { SuggestQuestionForm } from '@/components/client/SuggestQuestionForm'
import { getQuestion } from '@/lib/getQuestion'

export default async function SuggestQuestion({
  params: { path },
}: {
  params: { path: string[] }
}) {
  let question_id: string | undefined = undefined
  if (Array.isArray(path)) {
    question_id = path[0]
  } else if (typeof path === 'string') {
    question_id = path
  }

  const question = question_id
    ? await getQuestion({
        where: {
          question_id,
          canBeUsed: undefined,
        },
      })
    : null

  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">
        {question ? 'Edit the Question' : 'Suggest a Question'}
      </Headline>
      <SuggestQuestionForm question={question} />
    </section>
  )
}
