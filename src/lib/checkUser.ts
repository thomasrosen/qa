import { UserSchema, UserSchemaType, prisma } from '@/lib/prisma'

export async function checkUser(user: UserSchemaType) {
  const validatedUserFields = UserSchema.safeParse(user)
  console.log('saveAnswer-validatedUserFields', JSON.stringify(validatedUserFields, null, 2))

  if (!validatedUserFields.success) {
    throw new Error('User must exist and be verifyable.')
  }

  const user_id = validatedUserFields.data.user_id
  const privateIdentifier = validatedUserFields.data.privateIdentifier

  await prisma.user.findUnique({
    where: {
      user_id,
      privateIdentifier,
    },
    select: {
      user_id: true,
    },
    // include: {
    //   isThing: true,
    // },
  })
}
