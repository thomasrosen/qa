import { getTextEmbedding } from '@/lib/getTextEmbeddingsOpenAI'
import { addContent, createVectorStore } from '@/lib/vectorStore'
import { MarkdownTextSplitter } from '@langchain/textsplitters'
import similarity from 'compute-cosine-similarity'
import fs from 'fs'

// const text = require('./text.md')

// console.log('text', text.length)

const maxCharLengthForEmbedding = 2000 // only an estimation as its based on tokens not letters

export async function GET(request: Request): Promise<Response> {
  // const t = new URL(request.url).searchParams.get('t')

  // if (!t || typeof t !== 'string' || t.length === 0) {
  //   return Response.json({ error: 'No query provided' }, { status: 400 })
  // }

  const text = fs.readFileSync('./src/app/(normal)/api/lab/text.md', 'utf8')

  // split text into smaller chunks
  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: maxCharLengthForEmbedding,
  //   chunkOverlap: 0,
  // })
  const splitter = new MarkdownTextSplitter({
    chunkSize: maxCharLengthForEmbedding,
    chunkOverlap: 0,
  })
  const textParts = await splitter.splitText(text)

  // get the embedding of each chunk and group it to its text
  // const documentRes = await embeddings.embedDocuments(textParts)
  // const docs = documentRes.map((embedding, i) => {
  //   return {
  //     text: textParts[i],
  //     embedding,
  //   }
  // })

  // Initialize an embeddings instance
  // const embeddings = new OpenAIEmbeddings({
  //   openAIApiKey: process.env.OPENAI_API_KEY || '',
  //   // dimensions: 256,
  //   modelName: 'text-embedding-3-small',
  // })

  const vectorStore = createVectorStore()

  // // Initialize a NeonPostgres instance to store embedding vectors
  // const vectorStore = await NeonPostgres.initialize(embeddings, {
  //   connectionString: process.env.DATABASE_URL as string,
  // })

  // const documents = textParts.map((textPart, index) => ({
  //   pageContent: textPart,
  //   metadata: { index },
  // }))
  // const idsInserted = await vectorStore.addDocuments(documents)

  const documents = textParts.map((textPart, index) => ({
    content: textPart,
    metadata: { index },
  }))
  const idsInserted = await addContent({ vectorStore, texts: documents })

  return Response.json({
    idsInserted,
  })

  const splitterRegex = /\n\n(?!\s{4}|\t)/g // split by double new line, but not if its the same block of text (4 spaces or tab)
  const paragraphs = text.split(splitterRegex).flatMap((p) => {
    if (p.length > maxCharLengthForEmbedding) {
      return p.match(new RegExp(`.{1,${maxCharLengthForEmbedding}}`, 'g')) || []
    }
    return [p]
  })

  const aFewParagraphs = (
    await Promise.all(
      paragraphs.slice(0, 20).map(async (p, index) => {
        return {
          index,
          length: p.length,
          paragraph: p,
          embedding: (await getTextEmbedding(p)) || [],
          embeddingLength: ((await getTextEmbedding(p)) || []).length,
          similarity: 0,
          canBeGroupedWithPrev: false,
        }
      })
    )
  ).filter((p) => p.embedding && p.embedding.length > 0)

  aFewParagraphs.forEach((p, i) => {
    if (i === 0) {
      return
    }

    const prevP = aFewParagraphs[i - 1]

    if (
      prevP.paragraph.startsWith('#') ||
      p.paragraph.startsWith('```') ||
      prevP.paragraph.startsWith('```')
    ) {
      aFewParagraphs[i].canBeGroupedWithPrev = true
      return
    }

    const s = similarity(prevP.embedding, p.embedding) || 0
    aFewParagraphs[i].similarity = s
    aFewParagraphs[i].canBeGroupedWithPrev = s > 0.5 ? true : false
  })

  const newParagraphs = aFewParagraphs.reduce((acc, p, i) => {
    if (i === 0) {
      acc.push([p])
      return acc
    }

    const lastGroup = acc[acc.length - 1]
    const lastGroupLengthSum = lastGroup.reduce((acc, p) => acc + p.length, 0)

    if (
      p.canBeGroupedWithPrev &&
      lastGroupLengthSum + p.length < maxCharLengthForEmbedding
    ) {
      lastGroup.push(p)
    } else {
      acc.push([p])
    }

    return acc
  }, [] as any[][])
  // .map(
  //   (group) => group.map((p) => p.paragraph) //.join('\n\n')
  // )

  aFewParagraphs.forEach((p, i) => {
    aFewParagraphs[i].embedding = []
  })

  return Response.json({
    newParagraphs,
    aFewParagraphs,
  })
}
