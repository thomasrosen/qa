'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { QuestionSchema, prisma, type QuestionSchemaType } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function suggestQuestion(data: QuestionSchemaType) {
  try {
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_qGzNvYvh', 'user is required')
      return false
    }

    const validatedFields = QuestionSchema.safeParse(data)

    if (!validatedFields.success) {
      return false
    }

    const question_id = validatedFields.data.question_id
    delete validatedFields.data.question_id

    const createDataObj = {
      ...validatedFields.data,
      answerThingOptions: {
        connect: (validatedFields.data.answerThingOptions || []).map(
          (thing_id) => ({
            thing_id,
          })
        ),
      },
      createdBy: {
        connect: {
          // @ts-ignore Is already checked in isSignedOut()
          id: session.user.id,
        },
      },
    }

    if (question_id) {
      await prisma.question.upsert({
        where: {
          question_id,
        },
        update: {
          ...validatedFields.data,
          answerThingOptions: {
            set: (validatedFields.data.answerThingOptions || []).map(
              (thing_id) => ({
                thing_id,
              })
            ),
          },
        },
        create: createDataObj,
      })
    } else {
      await prisma.question.create({
        data: createDataObj,
      })
    }

    if (question_id) {
      revalidatePath(`/suggest_q/${question_id}`)
    }

    return true
  } catch (error) {
    console.error('ERROR_nUhs4oGa', error)
  }

  return false
}
