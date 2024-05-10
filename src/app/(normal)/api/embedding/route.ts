import { getTextEmbedding } from '@/lib/getTextEmbedding'

export async function GET(request: Request): Promise<Response> {
  const t = new URL(request.url).searchParams.get('t')

  if (!t || typeof t !== 'string' || t.length === 0) {
    return Response.json({ error: 'No query provided' }, { status: 400 })
  }

  const embedding = await getTextEmbedding(t)

  return Response.json({
    embedding,
  })
}
