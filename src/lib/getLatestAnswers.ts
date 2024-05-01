import { prisma } from '@/lib/prisma'
import { AnswerType, PrismaType } from '@/lib/types'

export async function getLatestAnswers({
  take = 1,
  where = {},
}: {
  take?: number
  where?: PrismaType.AnswerWhereInput | undefined
}): Promise<AnswerType[]> {
  try {
    const lastAnswers = await prisma.answer.findMany({
      relationLoadStrategy: 'join', // or 'query'
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        isAnswering: true,
        context: {
          include: {
            aboutThing: true,
          },
        },
      },
      take,
    })

    if (!lastAnswers || lastAnswers.length === 0) {
      return []
    }

    return lastAnswers.filter((answer) => answer && answer.isAnswering)
  } catch (error) {
    console.error('ERROR_B7C6ZYsW', error)
  }

  return []
}
