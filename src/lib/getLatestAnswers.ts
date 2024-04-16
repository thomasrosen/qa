import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
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
    // check if logged in
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_2e8d3f', 'user is required')
      return []
    }

    // @ts-ignore already checked with isSignedOut()
    const user_id = session.user.id

    const lastAnswers = await prisma.answer.findMany({
      relationLoadStrategy: 'join', // or 'query'
      where: {
        createdBy_id: user_id,
        ...where,
      },
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
