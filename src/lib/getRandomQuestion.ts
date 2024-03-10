import { prisma } from './prisma'

export async function getRandomQuestion() {
  const itemCount = await prisma.question.count()
  const skip = Math.floor(Math.random() * itemCount)
  const randomQuestion = await prisma.question.findMany({
    take: 1,
    skip,
    orderBy: {
      question_id: 'desc',
    },
  })

  if (randomQuestion.length === 0) {
    return null
  }

  return randomQuestion[0]
}
