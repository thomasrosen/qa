import { QuestionSchemaType, prisma } from '@/lib/prisma'
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
}: {
  q: string
  amount: number
}): Promise<QuestionSchemaType[]> {
  const result =
    (await similarTexts({ vectorStore, q, amount: amount * 2 })) || [] // amount * 2 to get more than we need

  const foundQuestions = result
    .filter((r) => (r.metadata._distance || 1) <= 0.2)
    .map((r) => r.pageContent)

  const questions =
    (await prisma.question.findMany({
      relationLoadStrategy: 'join', // or 'query'
      where: {
        canBeUsed: true,
        question: {
          in: foundQuestions,
        },
      },
      take: amount,
      // select: {
      //   question_id: true,
      //   question: true,
      //   description: true,
      // },
      include: {
        Answer_isAnswering: {
          include: {
            values: true,
            context: true,
          },
        },
        // context: true,
      },
    })) || []

  // const preloadedAnswer = await preloadAnswersForQuestion(question_id)

  return questions
}
