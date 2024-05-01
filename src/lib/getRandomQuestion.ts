import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
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
  const user = await getUser({
    where: {
      id: user_id,
    },
    select: {
      preferredTags: {
        select: {
          thing_id: true,
        },
      },
    },
  })
  const preferredTags =
    (user?.preferredTags || []).map((thing) => thing.thing_id) || []

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
          lte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // show the question again after about a month (30 day)
        },
      },
    ],
  }

  const questionWhere = {
    canBeUsed: true,
    // Answer_isAnswering: {
    //   every: answerWhere,
    // },
    tags: {
      some: {
        OR: [
          {
            thing_id: {
              in: preferredTags,
            },
          },
          {
            jsonld: {
              path: ['termCode'],
              equals: 'default',
            },
          },
        ],
      },
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
      tags: true,
    },
  })

  if (randomQuestion.length === 0) {
    return null
  }

  return randomQuestion[0]
}
