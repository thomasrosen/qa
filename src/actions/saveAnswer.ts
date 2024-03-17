'use server'

import { checkUser } from '@/lib/checkUser'
import { SaveAnswerSchema, SaveAnswerSchemaType, UserSchemaType, prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveAnswer({
  data,
  user,
}: {
  data: SaveAnswerSchemaType
  user: UserSchemaType
}) {
  try {
    await checkUser(user)

    const validatedDataFields = SaveAnswerSchema.safeParse(data)
    console.log(
      'INFO_9Qk0rn7X saveAnswer-validatedDataFields',
      JSON.stringify(validatedDataFields, null, 2)
    )

    if (!validatedDataFields.success) {
      return false
    }

    const isAnsweredByAgent_id = validatedDataFields.data.isAnsweredByAgent_id
    if (!isAnsweredByAgent_id || isAnsweredByAgent_id === '') {
      console.error('ERROR_2e8d3f', 'isAnsweredByAgent_id is required')
      return false
    }

    console.log('INFO_pWHEfMNQ saveAnswer-validatedDataFields.data', validatedDataFields.data)

    await prisma.answer.create({
      data: {
        isAnsweredByAgent: {
          connect: {
            thing_id: validatedDataFields.data.isAnsweredByAgent_id,
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
      // include: {
      //   isAbout: true,
      // },
    })

    revalidatePath('/q', 'page')

    return true
  } catch (error) {
    console.error('ERROR_Cd1Be83u', error)
  }

  return false
}
