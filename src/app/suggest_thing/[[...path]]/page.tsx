import { Headline } from '@/components/Headline'
import { SuggestThingForm } from '@/components/client/SuggestThingForm'
import { getThing } from '@/lib/getThing'

export default async function SuggestThing({
  params: { path },
}: {
  params: { path: string[] }
}) {
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
      <SuggestThingForm thing={thing} />
    </section>
  )
}
