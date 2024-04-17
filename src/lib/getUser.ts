import { prisma } from '@/lib/prisma'
import { UserSchemaType, type PrismaType } from '@/lib/types'

type FunctionArgs = {
  where?: PrismaType.UserWhereInput
  select?: PrismaType.UserSelect
  include?: PrismaType.UserInclude
}
export async function getUser({
  where = {},
  select,
  include,
}: FunctionArgs = {}): Promise<UserSchemaType | null> {
  const user = await prisma.user.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    where,
    include,
    select,
  })

  if (user.length === 0) {
    return null
  }

  return user[0]
}
