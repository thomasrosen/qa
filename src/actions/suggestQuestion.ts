'use server'

import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import {
  PrismaType,
  QuestionSchema,
  type QuestionSchemaType,
} from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function suggestQuestion(data: QuestionSchemaType) {
  try {
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_qGzNvYvh', 'user is required')
      return false
    }
    // @ts-ignore Is already checked in isSignedOut()
    const user_id = session.user.id
    const user = await getUser({
      where: {
        id: user_id,
      },
      select: {
        isAdmin: true,
      },
    })
    const isAdmin = user?.isAdmin || false

    const validatedFields = QuestionSchema.safeParse(data)
    if (!validatedFields.success) {
      return false
    }

    const question_id = validatedFields.data.question_id
    delete validatedFields.data.question_id

    const createDataObj = {
      ...validatedFields.data,
      tags: {
        connect: (validatedFields.data.tags || []).map((thing_id) => ({
          thing_id,
        })),
      },
      answerThingOptions: {
        connect: (validatedFields.data.answerThingOptions || []).map(
          (thing_id) => ({
            thing_id,
          })
        ),
      },
      createdBy: {
        connect: {
          id: user_id,
        },
      },
    }

    if (question_id) {
      const where: PrismaType.QuestionWhereUniqueInput = {
        question_id,
      }
      if (isAdmin === false) {
        where.createdBy = {
          id: user_id,
        }
      }

      await prisma.question.upsert({
        where,
        update: {
          ...validatedFields.data,
          tags: {
            set: (validatedFields.data.tags || []).map((thing_id) => ({
              thing_id,
            })),
          },
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
