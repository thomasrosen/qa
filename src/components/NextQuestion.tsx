import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { PreferredTagsChooser } from '@/components/client/PreferredTagsChooser'
import { QuestionCard } from '@/components/client/QuestionCard'
import { TS } from '@/components/translate/TServer'
import { auth } from '@/lib/auth'
import { getQuestion } from '@/lib/getQuestion'
import { getRandomQuestion } from '@/lib/getRandomQuestion'
import { getRandomThing } from '@/lib/getRandomThing'
import { getThings } from '@/lib/getThings'
import { getUser } from '@/lib/getUser'
import { Prisma } from '@/lib/prisma'

async function NoQuestionsFallback() {
  const session = await auth()
  const user_id = session?.user?.id

  if (!user_id) {
    return null
  }

  const user = await getUser({
    where: {
      id: user_id,
    },
    include: {
      preferredTags: {
        where: {
          canBeUsed: true,
        },
      },
    },
  })

  const tagOptions = await getThings({
    schemaTypes: ['CategoryCode'],
    where: {
      OR: [
        {
          jsonld: {
            path: ['termCode'],
            not: 'default',
          },
        },
        {
          jsonld: {
            path: ['termCode'],
            equals: Prisma.DbNull,
          },
        },
      ],
    },
  })

  if (!user) {
    return null
  }

  return (
    <>
      <P className="text-center">
        <TS>
          <strong>
            There are no questions available to answer in the chosen categories
            at the moment.
          </strong>
          <br />
          Every question can be answered only once every 12 month.
          <br />
          Check back later when we’ve added more questions.
        </TS>
      </P>
      <P className="text-center">
        <strong>
          <TS>Try adding more categories, to get more questions.</TS>
        </strong>
      </P>
      <PreferredTagsChooser user={user} tagOptions={tagOptions} />
    </>
  )
}

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
          <TS>
            <strong>Thanks for already answering this question!</strong>
            <br />
            Every question can be answered only once every 12 month.
          </TS>
        </P>
      )
    } else {
      return <NoQuestionsFallback />
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
      return <NoQuestionsFallback />
    }
  }

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2" className="border-0 p-0 mt-8 mb-2">
        <TS>Answer the question to know what others think…</TS>
      </Headline>
      <QuestionCard question={question} aboutThing={aboutThing ?? undefined} />
    </section>
  )
}
