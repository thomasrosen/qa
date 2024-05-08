import { getSimilarQuestions } from '@/lib/getSimilarQuestions'

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get('q')

  if (!q) {
    return Response.json({ error: 'No query provided' }, { status: 400 })
  }

  let amount = parseInt(new URL(request.url).searchParams.get('amount') || '10')
  if (!amount || amount < 1 || amount > 100) {
    amount = 10
  }

  const data = await getSimilarQuestions({ q, amount })
  return Response.json(data)
}
