import { prisma } from './prisma'

type FunctionArgs = {
  where?: Record<string, any> // TODO Fix type
}
export async function getRandomQuestion({ where = {} }: FunctionArgs = {}) {
  const itemCount = await prisma.question.count()
  const skip = Math.floor(Math.random() * itemCount)
  const randomQuestion = await prisma.question.findMany({
    take: 1,
    skip,
    orderBy: {
      question_id: 'desc',
    },
    where: {
      canBeUsed: true,
      ...where,
    },
  })

  if (randomQuestion.length === 0) {
    return null
  }

  return randomQuestion[0]
}
