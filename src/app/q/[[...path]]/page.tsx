import { AnswerChartWrapper } from '@/components/AnswerChartWrapper'
import NextQuestion from '@/components/NextQuestion'
import { SignIn } from '@/components/client/SignIn'
import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function Questions({
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

  const session = await auth()
  if (isSignedOut(session)) {
    return <SignIn />
  }

  return (
    <>
      <Suspense>
        <NextQuestion question_id={question_id} />
      </Suspense>

      <Suspense>
        {question_id ? (
          <AnswerChartWrapper question_id={question_id} />
        ) : (
          <AnswerChartWrapper />
        )}
      </Suspense>
    </>
  )
}
