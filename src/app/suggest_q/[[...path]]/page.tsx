import { Headline } from '@/components/Headline'
import { SuggestQuestionForm } from '@/components/client/SuggestQuestionForm'
import { getQuestion } from '@/lib/getQuestion'
import { getThings } from '@/lib/getThings'

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
          Answer_isAnswering: undefined,
        },
      })
    : null

  const tagOptions = await getThings({
    schemaTypes: ['CategoryCode'],
  })

  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">
        {question ? 'Edit the Question' : 'Suggest a Question'}
      </Headline>
      <SuggestQuestionForm question={question} tagOptions={tagOptions} />
    </section>
  )
}
