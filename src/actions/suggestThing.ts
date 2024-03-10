'use server'

import { prisma, ThingSchema, type ThingSchemaType } from '@/lib/prisma'

export async function suggestThing(data: ThingSchemaType) {
  try {
    const validatedFields = ThingSchema.safeParse(data)
    console.log('validatedFields', validatedFields)

    if (!validatedFields.success) {
      return false
    }

    await prisma.thing.create({ data: validatedFields.data })

    return true
  } catch (error) {
    console.error('ERROR_FR69vMRE', error)
  }

  return false
}
