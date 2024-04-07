'use server';

import { auth } from '@/lib/auth';
import { isSignedOut } from '@/lib/isSignedIn';
import { prisma, ThingSchema, type ThingSchemaType } from '@/lib/prisma';

export async function suggestThing(data: ThingSchemaType) {
  try {
    const session = await auth();
    console.log('INFO_7J2v3J2I session', session);
    if (isSignedOut(session)) {
      console.error('ERROR_eVar955X', 'user is required');
      return false;
    }

    const validatedFields = ThingSchema.safeParse(data);
    console.log('INFO_NNq62tuI validatedFields', validatedFields);

    if (!validatedFields.success) {
      return false;
    }

    const validatedData = {
      ...validatedFields.data,
      canBeUsed: false,
    };

    await prisma.thing.create({
      data: {
        ...(validatedData as any), // TODO Fix type
        createdBy: {
          connect: {
            // @ts-ignore Is already checked in isSignedOut()
            id: session.user.id,
          },
        },
      },
    });

    return true;
  } catch (error) {
    console.error('ERROR_FR69vMRE', error);
  }

  return false;
}
