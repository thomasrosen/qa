import { prisma } from '@/lib/prisma'

export async function createAnonymousUser() {
  try {
    const new_user = await prisma.user.create({
      data: {
        email: null,
        emailVerified: null,
        name: null,
        image: null,
      },
    })

    console.log('new_user', new_user)

    return new_user
  } catch (error) {
    console.log('error', error)
    throw new Error('Error creating anonymous user')
  }
}
