'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'
import { UserSchema } from '@/lib/types'

export async function savePreferredTags(data: any) {
  // any cause we validate it later
  try {
    // check if logged in
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_dGIy7X8s', 'user is required')
      return false
    }
    // @ts-ignore already checked in isSignedOut()
    const userId = session.user.id

    let preferredTags = []

    const validatedDataFields = UserSchema.safeParse(data)
    if (
      validatedDataFields.success &&
      data.preferredTags &&
      Array.isArray(data.preferredTags) &&
      data.preferredTags.length > 0
    ) {
      preferredTags = data.preferredTags
    }

    // save data.preferredTags to user
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        preferredTags: {
          set: preferredTags.map((thing_id: string) => ({
            thing_id,
          })),
        },
      },
    })

    return true
  } catch (error) {
    console.error('ERROR_Cd1Be83u', error)
  }

  return false
}
