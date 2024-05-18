import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

export async function getTextEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return null
    }

    const result = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    })

    return result.data[0].embedding
  } catch (error) {
    console.error('ERROR_BO2bU184', error)
  }

  return null
}
