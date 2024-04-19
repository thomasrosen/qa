import { Headline } from '@/components/Headline'
import { SuggestQuestionForm } from '@/components/client/SuggestQuestionForm'
import { auth } from '@/lib/auth'
import { getQuestion } from '@/lib/getQuestion'
import { getThings } from '@/lib/getThings'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { notFound } from 'next/navigation'

export default async function SuggestQuestion({
  params: { path },
}: {
  params: { path: string[] }
}) {
  const session = await auth()
  if (isSignedOut(session)) {
    notFound()
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id
  const user = await getUser({
    where: {
      id: user_id,
    },
    select: {
      isAdmin: true,
    },
  })
  const isAdmin = user?.isAdmin || false

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
          tags: undefined,
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
      <SuggestQuestionForm
        isAdmin={isAdmin}
        question={question}
        tagOptions={tagOptions}
      />
    </section>
  )
}
