import { Headline } from '@/components/Headline'
import { SuggestThingForm } from '@/components/client/SuggestThingForm'
import { auth } from '@/lib/auth'
import { getThing } from '@/lib/getThing'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { notFound } from 'next/navigation'

export default async function SuggestThingPage({
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

  let thing_id: string | undefined = undefined
  if (Array.isArray(path)) {
    thing_id = path[0]
  } else if (typeof path === 'string') {
    thing_id = path
  }

  const thing = thing_id
    ? await getThing({
        where: {
          thing_id,
          canBeUsed: undefined,
        },
      })
    : null

  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">
        {thing ? 'Edit the Thing' : 'Suggest a Thing'}
      </Headline>
      <SuggestThingForm isAdmin={isAdmin} thing={thing} />
    </section>
  )
}
