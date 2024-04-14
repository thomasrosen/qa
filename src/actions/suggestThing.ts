'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { ThingSchema, type ThingSchemaType } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function suggestThing(data: ThingSchemaType) {
  try {
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_STqUX1xO', 'user is required')
      return false
    }
    // @ts-ignore Is already checked in isSignedOut()
    const user_id = session.user.id

    const validatedFields = ThingSchema.safeParse(data)

    if (!validatedFields.success) {
      return false
    }

    const thing_id = validatedFields.data.thing_id
    delete validatedFields.data.thing_id

    const createDataObj = {
      ...validatedFields.data,
      createdBy: {
        connect: {
          id: user_id,
        },
      },
    }

    if (thing_id) {
      await prisma.thing.upsert({
        where: {
          thing_id,
          createdBy: {
            id: user_id,
          },
        },
        update: validatedFields.data,
        create: createDataObj,
      })
    } else {
      await prisma.thing.create({
        data: createDataObj,
      })
    }

    if (thing_id) {
      revalidatePath(`/suggest_thing/${thing_id}`)
    }

    return true
  } catch (error) {
    console.error('ERROR_nUhs4oGa', error)
  }

  return false
}
