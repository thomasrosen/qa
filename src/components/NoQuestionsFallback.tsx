import { P } from '@/components/P'
import { PreferredTagsChooser } from '@/components/client/PreferredTagsChooser'
import { auth } from '@/lib/auth'
import { getThings } from '@/lib/getThings'
import { getUser } from '@/lib/getUser'
import { Prisma } from '@/lib/prisma'
import { TS } from '@/translate/components/TServer'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'

export async function NoQuestionsFallback() {
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
      <P>
        <TS keys="NextQuestion">
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
      <P>
        <strong>
          <TS keys="NextQuestion">
            Try adding more categories, to get more questions.
          </TS>
        </strong>
      </P>
      <TranslationStoreEntryPoint
        keys={[
          'PreferredTagsChooser',
          'Combobox',
          ...(tagOptions || [])
            .map((thing) => thing.thing_id || '')
            .filter(Boolean),
        ]}
      >
        <PreferredTagsChooser user={user} tagOptions={tagOptions} />
      </TranslationStoreEntryPoint>
    </>
  )
}
