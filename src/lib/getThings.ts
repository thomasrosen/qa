import { prisma } from '@/lib/prisma'
import {
  type PrismaType,
  type SchemaTypeSchemaType,
  type ThingSchemaType,
} from '@/lib/types'

type FunctionArgs = {
  schemaTypes?: SchemaTypeSchemaType[]
  where?: PrismaType.ThingWhereInput
}
export async function getThings({
  schemaTypes,
  where = {},
}: FunctionArgs = {}): Promise<ThingSchemaType[]> {
  if (!where) {
    where = {}
  }

  if (Array.isArray(schemaTypes) && schemaTypes.length > 0) {
    where.type = {
      in: schemaTypes,
    }
  }

  const things = await prisma.thing.findMany({
    relationLoadStrategy: 'join', // or 'query'
    where: {
      canBeUsed: true,
      ...where,
    },
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          isTagFor: true,
        },
      },
    },
  })

  return things
}
