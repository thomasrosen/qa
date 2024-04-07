import { getAnswers } from '@/lib/getAnswers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const question_id = searchParams.get('question_id');
  if (typeof question_id !== 'string' || question_id.length === 0) {
    return Response.json({
      things: [],
      error: 'No question_id provided',
    });
  }

  const answers = await getAnswers({ question_id });

  const data = { answers };
  return Response.json(data);
}
