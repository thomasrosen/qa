import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { UserSchemaType, type PrismaType } from '@/lib/types'

type getUsersOverviewReturn = UserSchemaType & {
  _count: {
    createdAnswer: number
  }
}

type FunctionArgs = {
  where?: PrismaType.UserWhereInput
}
export async function getUsersOverview({
  where = {},
}: FunctionArgs = {}): Promise<getUsersOverviewReturn[]> {
  const session = await auth()
  if (isSignedOut(session)) {
    console.error('ERROR_tw1oVNOf', 'user is required')
    return []
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id
  const user = await getUser({
    where: {
      id: user_id,
    },
    select: {
      isAdmin: true,
    },
  })

  const isAdmin = user?.isAdmin || false

  if (!isAdmin) {
    return []
  }

  const users = await prisma.user.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 99, // TODO add pagination
    where: {
      ...where,
    },
    select: {
      id: true,
      index: true,
      createdAt: true,
      updatedAt: true,
      email: true,
      emailVerified: true,
      isAdmin: true,
      preferredTags: true,
      _count: {
        select: {
          createdAnswer: true,
        },
      },
    },
  })

  return users
}
