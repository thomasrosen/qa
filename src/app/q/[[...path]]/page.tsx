import { AnswerChartWrapper } from '@/components/AnswerChartWrapper'
import NextQuestion from '@/components/NextQuestion'
import { P } from '@/components/P'
import { SignIn } from '@/components/client/SignIn'
import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { TS } from '@/translate/components/TServer'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'
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
    <TranslationStoreEntryPoint
      keys={['Questions', 'PreferredTagsChooser', 'Combobox']}
    >
      <Suspense
        fallback={
          <P>
            <TS keys="Questions">Loading Question…</TS>
          </P>
        }
      >
        <NextQuestion question_id={question_id} />
      </Suspense>

      <Suspense
        fallback={
          <P>
            <TS keys="Questions">Loading Answer Chart…</TS>
          </P>
        }
      >
        {question_id ? (
          <AnswerChartWrapper question_id={question_id} />
        ) : (
          <AnswerChartWrapper />
        )}
      </Suspense>
    </TranslationStoreEntryPoint>
  )
}
