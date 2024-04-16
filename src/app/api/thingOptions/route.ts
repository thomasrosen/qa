import { getThings } from '@/lib/getThings'
import { SchemaTypeArraySchema } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const schemaTypesFromGet = searchParams.getAll('t')

  const validatedDataFields =
    SchemaTypeArraySchema.safeParse(schemaTypesFromGet)
  if (!validatedDataFields.success) {
    return Response.json({
      things: [],
      error: 'Invalid schema types',
    })
  }

  const things = await getThings({
    where: {
      type: {
        in: validatedDataFields.data,
      },
    },
  })

  const data = { things }
  return Response.json(data)
}
