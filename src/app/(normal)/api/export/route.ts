import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'

function recursivelyRemoveProperty(obj: Record<string, unknown>, key: string) {
  // recursively remove and property with the name "key"

  for (const property in obj) {
    if (property === key) {
      delete obj[property]
    } else if (typeof obj[property] === 'object') {
      recursivelyRemoveProperty(obj[property] as Record<string, unknown>, key)
    } else if (Array.isArray(obj[property])) {
      for (const element of obj[property] as Record<string, unknown>[]) {
        recursivelyRemoveProperty(element, key)
      }
    }
  }
}

export async function GET() {
  const session = await auth()
  if (isSignedOut(session)) {
    return Response.json({ error: 'you must be signed in' }, { status: 400 })
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id

  const userData = await prisma.user.findUnique({
    where: { id: user_id },
    select: {
      id: true,
      index: true,
      createdAt: true,
      updatedAt: true,
      name: true,
      email: true,
      emailVerified: true,
      preferredTags: {
        where: {
          canBeUsed: true,
        },
        select: {
          thing_id: true,
          index: true,
          createdAt: true,
          updatedAt: true,
          type: true,
          name: true,
        },
      },
      createdAnswer: {
        include: {
          isAnswering: true,
        },
      },
      createdValue: true,
      createdContext: true,
    },
  })

  if (userData) {
    recursivelyRemoveProperty(userData, 'index')
    recursivelyRemoveProperty(userData, 'createdBy_id')
    recursivelyRemoveProperty(userData, 'canBeUsed')
    recursivelyRemoveProperty(userData, 'locale')
  }

  const data = { data: userData }
  return Response.json(data)
}
