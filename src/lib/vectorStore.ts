import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type OpenAiIndexModel = {
  index?: number
  createdAt?: Date
  id?: string
  content: string
  metadata?: any // Prisma.JsonValue | null
  belongsToDocument: string
  positionInDocument: number
}

export function createVectorStore() {
  // Use the `withModel` method to get proper type hints for `metadata` field:
  const vectorStore = PrismaVectorStore.withModel<OpenAiIndexModel>(
    prisma
  ).create(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
      // batchSize: 512, // Default value if omitted is 512. Max is 2048
      // modelName: 'text-embedding-3-small',
    }),
    {
      prisma: Prisma,
      tableName: 'OpenAiIndex',
      vectorColumnName: 'embedding',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
        belongsToDocument: true,
        positionInDocument: true,
      },
    }
  )

  return vectorStore
}

export async function addContent({
  texts = [],
  vectorStore,
}: {
  texts: OpenAiIndexModel[]
  vectorStore: ReturnType<typeof createVectorStore>
}) {
  return await vectorStore.addModels(
    await prisma.$transaction(
      texts.map((fields) =>
        prisma.openAiIndex.create({
          data: {
            ...fields,
            belongsToDocument: fields.belongsToDocument || '_',
            positionInDocument: fields.positionInDocument || 0,
          },
        })
      )
    )
  )
}

export async function similarTexts({
  q,
  amount = 10,
  vectorStore,
}: {
  q: string
  amount?: number
  vectorStore: ReturnType<typeof createVectorStore>
}) {
  // const metadata = {
  //   hello: 'world',
  // }
  // const texts = ['Who am i?']
  // await vectorStore.addModels(
  //   await prisma.$transaction(
  //     texts.map((content) =>
  //       prisma.openAiIndex.create({ data: { content, metadata } })
  //     )
  //   )
  // )

  // Use the default filter a.k.a {"content": "default"}
  // const resultTwo = await vectorStore.similaritySearch(q, amount, {
  //   metadata: {
  //     equals: {
  //       hello: 'world',
  //     },
  //   },
  // })
  // console.log('LOG_yhDXFBHE', resultTwo)

  const results = await vectorStore.similaritySearch(q, amount)
  return results
}
