import { P } from '@/components/P'
import { PreferredTagsChooser } from '@/components/client/PreferredTagsChooser'
import { auth } from '@/lib/auth'
import { getThings } from '@/lib/getThings'
import { getUser } from '@/lib/getUser'
import { Prisma } from '@/lib/prisma'
import { TS } from '@/translate/components/TServer'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'
import { Headline } from './Headline'

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
    <section className="flex flex-col gap-4 mb-4 place-content-center">
      <Headline type="h2">
        <TS keys="NextQuestion">Questions</TS>
      </Headline>
      <P>
        <TS keys="NextQuestion">
          <strong>You answered all questions in the chosen categories.</strong>
          <br />
          Every question can be answered only once every month.
          <br />
          Check back later when we’ve added more questions or chose more
          categories.
        </TS>
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
        <PreferredTagsChooser
          user={user}
          tagOptions={tagOptions}
          fullReload={true}
        />
      </TranslationStoreEntryPoint>
    </section>
  )
}
