'use server'

import { getQuestion } from '@/lib/getQuestion'
import { getRandomQuestion } from '@/lib/getRandomQuestion'

export async function preloadQuestion(question_id?: string) {
  if (question_id) {
    return await getQuestion({
      where: {
        question_id,
      },
    })
  } else {
    return await getRandomQuestion()
  }
}
