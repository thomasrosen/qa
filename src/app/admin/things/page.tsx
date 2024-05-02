import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { DEFAULT_LOCALE } from '@/lib/constants'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { stringToColor } from '@/lib/stringToColour'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ThingsPage() {
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

  const things = await prisma.thing.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      createdBy: true,
    },
  })

  return (
    <section className="flex flex-col gap-4 mb-4 place-content-center mx-0 lg:-mx-40">
      <Headline type="h2">Dinge</Headline>

      {things.map((thing) => {
        const typeColor = stringToColor(thing.type || '')
        return (
          <div key={thing.thing_id} className="flex gap-4 justify-between">
            <div className="w-full">
              <ThingRow
                thing={thing}
                className={cn(
                  'bg-transparent p-0 m-0',
                  thing.canBeUsed ? '' : 'line-through opacity-60'
                )}
              />
              <P type="ghost" className="m-0" style={{ color: typeColor }}>
                {[
                  thing.updatedAt.toLocaleString(DEFAULT_LOCALE),
                  thing.type,
                ].join(' • ')}
              </P>
            </div>
            <div className="flex gap-2">
              <Link href={`/suggest_thing/${thing.thing_id}`}>
                <Button>Bearbeiten</Button>
              </Link>
            </div>
          </div>
        )
      })}
    </section>
  )
}
