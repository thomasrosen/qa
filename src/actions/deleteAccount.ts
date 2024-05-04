'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'

export async function deleteAccount() {
  try {
    const session = await auth()
    if (isSignedOut(session)) {
      console.error('ERROR_STqUX1xO', 'user is required')
      return false
    }
    // @ts-ignore Is already checked in isSignedOut()
    const user_id = session.user.id

    await prisma.value.deleteMany({
      where: { createdBy_id: user_id },
    })
    await prisma.context.deleteMany({
      where: { createdBy_id: user_id },
    })
    await prisma.answer.deleteMany({
      where: { createdBy_id: user_id },
    })
    await prisma.user.update({
      // we can't delete the account, as things and questions could be linked to it. But we can anonymize it.
      where: { id: user_id },
      data: {
        preferredTags: {
          set: [],
        },
        name: null,
        email: null,
        emailVerified: null,
        image: null,
        isAdmin: false,
        isDeleted: true,
      },
    })

    return true
  } catch (error) {
    console.error('ERROR_iA35Jhb2', error)
    return false
  }

  return false
}
