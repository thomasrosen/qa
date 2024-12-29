import { createVectorStore } from '@/lib/vectorStore'
import { OpenAI } from '@langchain/openai'
// import { MarkdownTextSplitter } from '@langchain/textsplitters'
// import fs from 'fs'

// const maxCharLengthForEmbedding = 2000 // only an estimation as its based on tokens not letters

const vectorStore = createVectorStore()

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q')

  if (!query || typeof query !== 'string' || query.length === 0) {
    return Response.json({ error: 'No query provided' }, { status: 400 })
  }

  // const text = fs.readFileSync('./src/app/(normal)/api/lab/text.md', 'utf8')

  // split text into smaller chunks
  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: maxCharLengthForEmbedding,
  //   chunkOverlap: 0,
  // })
  // const splitter = new MarkdownTextSplitter({
  //   chunkSize: maxCharLengthForEmbedding,
  //   chunkOverlap: 0,
  // })
  // const textParts = await splitter.splitText(text)

  // const documents = textParts.map((textPart, index) => ({
  //   pageContent: textPart,
  //   metadata: {
  //     belongsToDocument: 'test_text',
  //     positionInDocument: index,
  //   },
  // }))
  // const idsInserted = await vectorStore.addDocuments(documents)

  // const documents = textParts.map((textPart, index) => ({
  //   content: textPart,
  //   belongsToDocument: 'test_text',
  //   positionInDocument: index,
  //   metadata: {},
  // }))
  // const idsInserted = await addContent({ vectorStore, texts: documents })

  const docs = (
    await vectorStore.similaritySearch(query, 20, {
      belongsToDocument: {
        in: ['test_text'],
      },
    })
  )
    .filter((doc) => (doc.metadata._distance || 1) < 0.2)
    .sort(
      (a, b) => a.metadata.positionInDocument - b.metadata.positionInDocument
    )
    .map((doc) => doc.pageContent)
    .join('\n\n')

  const model = new OpenAI({
    modelName: 'gpt-4o',
    temperature: 1,
    openAIApiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  })
  const answer = await model.invoke(
    `Task: Answer the query based on the given sources. Rephrase the text to fit to the style of the question. Only answer based on the sources. Include Best Practices if any are directly provided in the sources. If no answer can be found suggest similar topics based only on the sources. Always answer in the language of the question/query.\n\nSources: ${docs}\n\nQuestion/Query: ${query}\n\nAnswer:`
  )

  return new Response(answer)

  return Response.json({
    answer,
    docs,
  })
}
