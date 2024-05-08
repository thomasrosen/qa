import { getSimilarQuestions } from '@/lib/getSimilarQuestions'

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get('q')

  if (!q) {
    return Response.json({ error: 'No query provided' }, { status: 400 })
  }

  let useAutocomplete = false
  const autocomplete = new URL(request.url).searchParams.get('ac')
  if (typeof autocomplete === 'string') {
    // check if autocomplete is in the searchParams
    // but there does not need to be any value as we use it as a boolean
    useAutocomplete = true
  }

  let amount = parseInt(new URL(request.url).searchParams.get('amount') || '10')
  if (!amount || amount < 1 || amount > 100) {
    amount = 10
  }

  const data = await getSimilarQuestions({
    q,
    amount,
    threshold: 0.5,
    select: useAutocomplete ? { question_id: true, question: true } : undefined,
  })
  return Response.json(data)
}
