import { QuestionSchemaType, prisma, type Prisma } from '@/lib/prisma'
import { addContent, createVectorStore, similarTexts } from '@/lib/vectorStore'

const vectorStore = createVectorStore()

async function addAllQuestionsToVectorStore() {
  console.log('addAllQuestionsToVectorStore', addAllQuestionsToVectorStore)
  const questions = await prisma.question.findMany({
    select: {
      question: true,
    },
  })

  const texts = questions
    .filter((q) => q.question)
    .map((q) => ({
      content: q.question || '',
      metadata: {},
    }))

  const result = await addContent({ texts, vectorStore })
  console.log('result', result)
}

export async function getSimilarQuestions({
  q,
  amount,
  threshold = 0.2,
  where = {},
  select = undefined,
  include = undefined,
}: {
  q: string
  amount: number
  threshold?: number
  where?: Prisma.QuestionWhereInput
  select?: Prisma.QuestionSelect
  include?: Prisma.QuestionInclude
}): Promise<QuestionSchemaType[]> {
  const amountTimesTwo = amount * 2 // amount * 2 to get more than we need

  const result =
    (await similarTexts({ vectorStore, q, amount: amountTimesTwo })) || []

  const foundQuestions = result
    .filter((r) => (r.metadata._distance || 0) <= threshold)
    .map((r) => r.pageContent)

  if (!select && !include) {
    include = {
      Answer_isAnswering: {
        include: {
          values: true,
          context: true,
        },
      },
      // context: true,
    }
  }

  let questions: QuestionSchemaType[] =
    (await prisma.question.findMany({
      relationLoadStrategy: 'join', // or 'query'
      where: {
        canBeUsed: true,
        question: {
          in: foundQuestions,
        },
        ...where,
      },
      take: amountTimesTwo,
      select,
      include,
    })) || []

  questions = questions
    .filter(Boolean)
    .map((q) => {
      const found = result.find((r) => r.pageContent === q.question)
      if (found) {
        q._distance = found.metadata._distance
      } else {
        q._distance = 1
      }

      return q
    })
    .sort((a, b) => (a._distance || 1) - (b._distance || 1))
    .slice(0, amount)

  // const preloadedAnswer = await preloadAnswersForQuestion(question_id)

  return questions
}
