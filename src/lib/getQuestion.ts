import { QuestionSchemaType, prisma, type Prisma } from '@/lib/prisma'

type FunctionArgs = {
  where?: Prisma.QuestionWhereInput
}
export async function getQuestion({
  where = {},
}: FunctionArgs = {}): Promise<QuestionSchemaType | null> {
  const question = await prisma.question.findMany({
    relationLoadStrategy: 'join', // or 'query'
    take: 1,
    where: {
      canBeUsed: true,
      ...where,
    },
    include: {
      answerThingOptions: true,
    },
  })

  if (question.length === 0) {
    return null
  }

  return question[0]
}
