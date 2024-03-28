'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { SaveAnswerSchema, SaveAnswerSchemaType, prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveAnswer(data: SaveAnswerSchemaType) {
  try {
    // check if logged in
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_2e8d3f', 'user is required')
      return false
    }

    const validatedDataFields = SaveAnswerSchema.safeParse(data)
    if (!validatedDataFields.success) {
      return false
    }

    // @ts-ignore Is already checked in isSignedOut()
    const isAnsweredByAgent_id = session.user.id

    await prisma.answer.create({
      data: {
        isAnsweredByAgent: {
          connect: {
            id: isAnsweredByAgent_id,
          },
        },
        isAnswering: {
          connect: {
            question_id: validatedDataFields.data.isAnswering_id,
          },
        },
        values: {
          create: validatedDataFields.data.values,
        },
        isAbout: {
          connect: {
            thing_id: validatedDataFields.data.isAbout_id,
          },
        },
      },
    })

    revalidatePath('/q', 'page')

    return true
  } catch (error) {
    console.error('ERROR_Cd1Be83u', error)
  }

  return false
}
