import { SchemaTypeArraySchema, prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const schemaTypesFromGet = searchParams.getAll('t')
  const validatedDataFields = SchemaTypeArraySchema.safeParse(schemaTypesFromGet)
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
    },
  })

  const data = { things }
  return Response.json(data)
}
