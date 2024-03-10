import { prisma } from './prisma'

export async function getRandomThing() {
  const itemCount = await prisma.thing.count()
  const skip = Math.floor(Math.random() * itemCount)
  const randomThing = await prisma.thing.findMany({
    take: 1,
    skip,
    orderBy: {
      thing_id: 'desc',
    },
  })

  if (randomThing.length === 0) {
    return null
  }

  return randomThing[0]
}
