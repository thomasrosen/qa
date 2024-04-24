import { AboutYouCard } from '@/components/AboutYouCard'
import { PreferredTagsChooser } from '@/components/client/PreferredTagsChooser'
import { auth } from '@/lib/auth'
import { getThings } from '@/lib/getThings'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { Prisma } from '@/lib/prisma'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'
import { redirect } from 'next/navigation'

export default async function AboutYou() {
  const session = await auth()
  if (isSignedOut(session)) {
    redirect('/')
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id

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

  if (!user) {
    return null
  }

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

  return (
    <TranslationStoreEntryPoint
      keys={[
        'aboutYou',
        'PreferredTagsChooser',
        'Combobox',
        ...(tagOptions || [])
          .map((thing) => thing.thing_id || '')
          .filter(Boolean),
      ]}
    >
      <section className="flex flex-col gap-4 mb-4 place-content-center">
        <AboutYouCard user={user} />
        <PreferredTagsChooser user={user} tagOptions={tagOptions} />
      </section>
    </TranslationStoreEntryPoint>
  )
}
