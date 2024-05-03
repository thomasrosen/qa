import { Headline } from '@/components/Headline'
import { HideFromTranslation } from '@/components/HideFromTranslation'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { auth } from '@/lib/auth'
import { DEFAULT_LOCALE } from '@/lib/constants'
import { getUser } from '@/lib/getUser'
import { getUsersOverview } from '@/lib/getUserOverview'
import { isSignedOut } from '@/lib/isSignedIn'
import { cn } from '@/lib/utils'
import { TS } from '@/translate/components/TServer'
import { notFound } from 'next/navigation'

export default async function UsersPage() {
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

  const users = await getUsersOverview()

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center mx-0 lg:-mx-40">
      <Headline type="h2">
        <TS keys="admin/users">Users</TS>
      </Headline>

      {users.map((user) => {
        const amountOfAnswers = user._count.createdAnswer

        return (
          <div key={user.id} className="flex gap-4 justify-between mb-4">
            <div className="flex flex-col gap-1">
              <strong
                className={cn(
                  'font-mono',
                  amountOfAnswers > 0 ? '' : 'line-through opacity-60'
                )}
              >
                {user.id}
              </strong>

              <P type="ghost" className="m-0 flex-col flex">
                {user.email && <span>{user.email}</span>}
                {user.updatedAt && (
                  <span>{user.updatedAt.toLocaleString(DEFAULT_LOCALE)}</span>
                )}
                <strong>
                  <TS keys="admin/questions">
                    {amountOfAnswers === 1 ? (
                      'One Answer'
                    ) : (
                      <>
                        <HideFromTranslation real={amountOfAnswers}>
                          [Unkown number]
                        </HideFromTranslation>{' '}
                        Answers
                      </>
                    )}
                  </TS>
                </strong>
              </P>
              {user.preferredTags && user.preferredTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.preferredTags.map((thing) => (
                    <ThingRow
                      key={thing.thing_id}
                      thing={thing}
                      className="w-auto inline-block"
                    />
                  ))}
                </div>
              )}
            </div>
            {/*
          <div className="flex gap-2">
            <Link href={`/q/${question.question_id}`}>
              <Button variant="outline">
                <TS keys="admin/questions">View</TS>
              </Button>
            </Link>
            <Link href={`/suggest_q/${question.question_id}`}>
              <Button>
                <TS keys="admin/questions">Edit</TS>
              </Button>
            </Link>
          </div>
          */}
          </div>
        )
      })}
    </section>
  )
}
