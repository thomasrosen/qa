// 'use server'

// import { auth } from '@/lib/auth'
// import { isSignedOut } from '@/lib/isSignedIn'
// import { prisma, ThingSchema, type ThingSchemaType } from '@/lib/prisma'

// export async function suggestThing(data: ThingSchemaType) {
//   try {
//     const session = await auth()
//     console.log('INFO_7J2v3J2I session', session)
//     if (isSignedOut(session)) {
//       console.error('ERROR_eVar955X', 'user is required')
//       return false
//     }

//     const validatedFields = ThingSchema.safeParse(data)
//     console.log('INFO_NNq62tuI validatedFields', validatedFields)

//     if (!validatedFields.success) {
//       return false
//     }

//     const validatedData = {
//       ...validatedFields.data,
//       canBeUsed: false,
//     }

//     await prisma.thing.create({
//       data: {
//         ...(validatedData as any), // TODO Fix type
//         createdBy: {
//           connect: {
//             // @ts-ignore Is already checked in isSignedOut()
//             id: session.user.id,
//           },
//         },
//       },
//     })

//     return true
//   } catch (error) {
//     console.error('ERROR_FR69vMRE', error)
//   }

//   return false
// }

'use server'

import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { ThingSchema, prisma, type ThingSchemaType } from '@/lib/prisma'
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
