import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function Questions() {
  const session = await auth()
  if (isSignedOut(session)) {
    notFound()
  }
  const user = await getUser({
    select: {
      isAdmin: true,
    },
  })
  const isAdmin = user?.isAdmin || false

  if (!isAdmin) {
    notFound()
  }

  const questions = await prisma.question.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      tags: true,
      createdBy: true,
    },
  })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2">Questions</Headline>

      {questions.map((question) => (
        <div
          key={question.question_id}
          className="flex gap-4 justify-between mb-4"
        >
          <div className="flex flex-col gap-1">
            <strong
              className={question.canBeUsed ? '' : 'line-through opacity-60'}
            >
              {question.question}
            </strong>
            <P type="ghost" className="m-0">
              {question.updatedAt.toISOString()}
            </P>
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.tags.map((thing) => (
                  <ThingRow
                    key={thing.thing_id}
                    thing={thing}
                    className="w-auto inline-block"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/suggest_q/${question.question_id}`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Link href={`/q/${question.question_id}`}>
              <Button variant="outline">View</Button>
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}
