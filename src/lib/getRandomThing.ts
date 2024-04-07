import { prisma } from '@/lib/prisma'

type FunctionArgs = {
  where?: Record<string, any> // TODO Fix type
}
export async function getRandomThing({ where = {} }: FunctionArgs = {}) {
  const itemCount = await prisma.thing.count({
    where: {
      canBeUsed: true,
      ...where,
    },
  })

  const skip = Math.floor(Math.random() * itemCount)
  const randomThing = await prisma.thing.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    skip,
    orderBy: {
      thing_id: 'desc',
    },
    where: {
      canBeUsed: true,
      ...where,
    },
  })

  if (randomThing.length === 0) {
    return null
  }

  return randomThing[0]
}
