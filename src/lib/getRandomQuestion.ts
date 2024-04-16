import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'

type FunctionArgs = {
  where?: Record<string, any> // TODO Fix type
}
export async function getRandomQuestion({ where = {} }: FunctionArgs = {}) {
  const session = await auth()
  if (isSignedOut(session)) {
    console.error('ERROR_tw1oVNOf', 'user is required')
    return null
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id

  const answerWhere = {
    OR: [
      {
        createdBy_id: {
          not: user_id,
        },
      },
      {
        createdBy_id: {
          equals: user_id,
        },
        updatedAt: {
          lte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365), // show the question again after a year
        },
      },
    ],
  }

  const questionWhere = {
    canBeUsed: true,
    Answer_isAnswering: {
      every: answerWhere,
    },
    ...where,
  }

  const itemCount = await prisma.question.count({
    where: questionWhere,
  })
  const skip = Math.floor(Math.random() * itemCount)

  const randomQuestion = await prisma.question.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    skip,
    orderBy: {
      question_id: 'desc',
    },
    where: questionWhere,
    include: {
      answerThingOptions: true,
    },
  })

  if (randomQuestion.length === 0) {
    return null
  }

  return randomQuestion[0]
}
