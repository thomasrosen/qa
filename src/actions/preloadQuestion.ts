'use server'

import { getQuestion } from '@/lib/getQuestion'
import { getRandomQuestion } from '@/lib/getRandomQuestion'

export async function preloadQuestion({
  question_id,
  not_question_id = [],
}: {
  question_id?: string
  not_question_id?: string[]
} = {}) {
  if (typeof question_id === 'string' && question_id.length > 0) {
    return await getQuestion({
      where: {
        question_id,
      },
    })
  } else {
    if (Array.isArray(not_question_id) && not_question_id.length > 0) {
      return await getQuestion({
        where: {
          question_id: {
            notIn: not_question_id,
          },
        },
      })
    } else {
      return await getRandomQuestion()
    }
  }
}
