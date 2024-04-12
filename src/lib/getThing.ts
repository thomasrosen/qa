import { ThingSchemaType, prisma, type Prisma } from '@/lib/prisma'

type FunctionArgs = {
  where?: Prisma.ThingWhereInput
}
export async function getThing({
  where = {},
}: FunctionArgs = {}): Promise<ThingSchemaType | null> {
  const thing = await prisma.thing.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    where: {
      canBeUsed: true,
      ...where,
    },
  })

  if (thing.length === 0) {
    return null
  }

  return thing[0]
}
