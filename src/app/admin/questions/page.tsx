import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { replaceLastWhitespaceWithNonBreaking } from '@/translate/lib/replaceLastWhitespaceWithNonBreaking'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function QuestionsPage() {
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

  if (!isAdmin) {
    notFound()
  }

  const questions = await prisma.question.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      tags: {
        include: {
          _count: {
            select: {
              isTagFor: true,
            },
          },
        },
      },
      createdBy: true,
    },
  })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2">Fragen</Headline>

      {questions.map((question) => (
        <div
          key={question.question_id}
          className="flex gap-4 justify-between mb-4"
        >
          <div className="flex flex-col gap-1">
            <strong
              className={question.canBeUsed ? '' : 'line-through opacity-60'}
              dangerouslySetInnerHTML={{
                __html: replaceLastWhitespaceWithNonBreaking(
                  question.question || ''
                ),
              }}
            />
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
              <Button variant="outline">Bearbeiten</Button>
            </Link>
            <Link href={`/q/${question.question_id}`}>
              <Button variant="outline">Anzeigen</Button>
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}
