'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import {
  SaveAnswerSchema,
  SaveAnswerSchemaType,
  prisma,
  type PrismaType,
} from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveAnswer(data: SaveAnswerSchemaType) {
  try {
    revalidatePath('/q', 'page')

    // check if logged in
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_dGIy7X8s', 'user is required')
      return false
    }
    // @ts-ignore already checked in isSignedOut()
    const userId = session.user.id

    const validatedDataFields = SaveAnswerSchema.safeParse(data)
    if (!validatedDataFields.success) {
      return false
    }

    if (!validatedDataFields.data.isAnswering_id) {
      return false
    }

    const dataObj: any = {
      createdBy: {
        connect: {
          id: userId,
        },
      },
      isAnswering: {
        connect: {
          question_id: validatedDataFields.data.isAnswering_id,
        },
      },
    }

    const answerResponse = await prisma.answer.create({
      relationLoadStrategy: 'join', // or 'query'
      data: dataObj as any,
    })
    revalidatePath('/q', 'page')

    if (answerResponse && answerResponse.answer_id) {
      ;(async () => {
        await prisma.context.createMany({
          data: validatedDataFields.data.context.map((context) => ({
            ...context,
            createdBy_id: userId,
            isContextFor_id: answerResponse.answer_id,
          })) as PrismaType.ContextCreateManyInput[],
        })

        await prisma.value.createMany({
          data: validatedDataFields.data.values.map((value) => ({
            ...value,
            createdBy_id: userId,
            isValueFor_id: answerResponse.answer_id,
          })) as PrismaType.ValueCreateManyInput[],
        })

        revalidatePath('/q', 'page')
      })()
    }

    return true
  } catch (error) {
    console.error('ERROR_Cd1Be83u', error)
  }

  return false
}
