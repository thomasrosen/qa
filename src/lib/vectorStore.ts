import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { OpenAIEmbeddings } from '@langchain/openai'
import { OpenAiIndex, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export async function similarTexts() {
  // Use the `withModel` method to get proper type hints for `metadata` field:
  const vectorStore = PrismaVectorStore.withModel<OpenAiIndex>(prisma).create(
    new OpenAIEmbeddings({
      // openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
      // batchSize: 512, // Default value if omitted is 512. Max is 2048
      // modelName: 'text-embedding-3-large',
    }),
    {
      prisma: Prisma,
      tableName: 'OpenAiIndex',
      vectorColumnName: 'embedding',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    }
  )

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
  const resultTwo = await vectorStore.similaritySearch('who am i', 10, {
    metadata: {
      equals: {
        hello: 'world',
      },
    },
  })
  console.log('LOG_yhDXFBHE', resultTwo)

  return resultTwo
}
