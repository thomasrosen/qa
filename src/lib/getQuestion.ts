import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { QuestionSchemaType, type PrismaType } from '@/lib/types'

type FunctionArgs = {
  where?: PrismaType.QuestionWhereInput
}
export async function getQuestion({
  where = {},
}: FunctionArgs = {}): Promise<QuestionSchemaType | null> {
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

  const question = await prisma.question.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    where: questionWhere,
    include: {
      answerThingOptions: true,
    },
  })

  if (question.length === 0) {
    return null
  }

  return question[0]
}
