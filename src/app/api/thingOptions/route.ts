import { prisma } from '@/lib/prisma'
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

  // load all things with the datatypes
  const things = await prisma.thing.findMany({
    where: {
      type: {
        in: validatedDataFields.data,
      },
      canBeUsed: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const data = { things }
  return Response.json(data)
}
