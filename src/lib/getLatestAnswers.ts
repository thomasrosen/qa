import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { AnswerType, prisma } from '@/lib/prisma'

export async function getLatestAnswers({
  take = 1,
}: {
  take?: number
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
      },
      distinct: ['createdBy_id', 'isAnswering_id'], // TODO about is missing here
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        isAnswering: true,
        context: true,
      },
      take,
    })

    if (!lastAnswers || lastAnswers.length === 0) {
      return []
    }
    return lastAnswers.filter((answer) => answer && answer.isAnswering)
  } catch (error) {
    console.error(error)
  }

  return []
}
