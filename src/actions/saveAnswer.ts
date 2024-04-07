'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { SaveAnswerSchema, SaveAnswerSchemaType, prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveAnswer(data: SaveAnswerSchemaType) {
  try {
    revalidatePath('/q', 'page')

    // check if logged in
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_2e8d3f', 'user is required')
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
      values: {
        create: validatedDataFields.data.values.map((value) => ({
          ...value,
          createdBy_id: userId,
        })),
        // create: validatedDataFields.data.values.map((value) => {
        //   if (value.valueAsThing_id) {
        //     return {
        //       ...value,
        //       valueAsThing_id: undefined,
        //       valueAsThing: {
        //         connect: {
        //           thing_id: value.valueAsThing_id,
        //         },
        //       },
        //       // createdBy: {
        //       //   connect: {
        //       //     id: userId,
        //       //   },
        //       // },
        //     }
        //   }
        //
        //   return {
        //     ...value,
        //     valueAsThing_id: undefined,
        //     // createdBy: {
        //     //   connect: {
        //     //     id: userId,
        //     //   },
        //     // },
        //   }
        // }),
      },
    }

    if (validatedDataFields.data.isAbout_id) {
      dataObj.isAbout = {
        connect: {
          thing_id: validatedDataFields.data.isAbout_id,
        },
      }
    }

    ;(async () => {
      await prisma.answer.create({
        relationLoadStrategy: 'join', // or 'query'
        data: dataObj as any,
      })
      revalidatePath('/q', 'page')
    })()

    return true
  } catch (error) {
    console.error('ERROR_Cd1Be83u', error)
  }

  return false
}
