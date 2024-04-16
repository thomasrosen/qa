import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
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
  const session = await auth()
  if (isSignedOut(session)) {
    console.error('ERROR_tw1oVNOf', 'user is required')
    return null
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id

  const user = await prisma.user.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    where: {
      id: user_id,
      ...where,
    },
    include,
    select,
  })

  if (user.length === 0) {
    return null
  }

  return user[0]
}
