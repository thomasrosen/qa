'use server'

import { prisma, QuestionSchema, type QuestionSchemaType } from '@/lib/prisma'

export async function suggest(data: QuestionSchemaType) {
  try {
    const validatedFields = QuestionSchema.safeParse(data)
    if (!validatedFields.success) {
      return false
    }

    await prisma.question.create({ data: validatedFields.data })

    return true
  } catch (error) {
    console.error('ERROR_nUhs4oGa', error)
  }

  return false
}
