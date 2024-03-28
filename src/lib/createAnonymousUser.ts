import { prisma } from '@/lib/prisma'

export async function createAnonymousUser() {
  try {
    const new_user = await prisma.user.create({
      data: {
        email: null,
      },
    })

    return new_user
  } catch (error) {
    console.log('ERROR_pouIZGle', error)
    throw new Error('Error creating anonymous user')
  }
}
