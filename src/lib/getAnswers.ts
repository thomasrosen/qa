// import { auth } from '@/lib/auth';
// import { isSignedOut } from '@/lib/isSignedIn';
import { prisma } from '@/lib/prisma'
import { ExtendedValueSchemaType, PrismaType } from '@/lib/types'

export async function getAnswers({
  question_id,
  aboutThing_id,
}: {
  question_id: string
  aboutThing_id?: string
}) {
  const defaultReturn = {
    amountOfAnswers: 0,
    newestValueDate: null,
    values: [],
  }

  try {
    // // check if logged in
    // const session = await auth();
    // if (isSignedOut(session)) {
    //   console.error('ERROR_MqRzPEiZ', 'user is required');
    //   return [];
    // }

    if (!question_id) {
      return defaultReturn
    }

    const where: PrismaType.ValueWhereInput = {
      isValueFor: {
        isAnswering_id: question_id,
      },
    }

    if (aboutThing_id && where.isValueFor) {
      where.isValueFor.context = { some: { aboutThing_id } }
    }

    const newestValue = await prisma.value.findFirst({
      relationLoadStrategy: 'join', // or 'query'
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
      },
      take: 1,
    })

    const values = await prisma.value.groupBy({
      by: [
        'valueType',
        'valueAsString',
        'valueAsNumber',
        'valueAsBoolean',
        'valueAsThing_id',
        // group by unique value
      ],
      where,
      _count: {
        _all: true, // get how often this exact value appears
      },
    })

    const thing_ids = values
      .filter(
        (value) =>
          value.valueType === 'Thing' &&
          typeof value.valueAsThing_id === 'string'
      )
      .map((value) => value.valueAsThing_id)

    const mappedValues: ExtendedValueSchemaType[] = values
      .map((value) => ({
        ...value,
        valueAsThing: undefined,
      }))
      .sort(
        (a: { _count: { _all: number } }, b: { _count: { _all: number } }) => {
          if (a._count._all > b._count._all) {
            return -1
          }
          if (a._count._all < b._count._all) {
            return 1
          }
          return 0
        }
      )

    if (Array.isArray(thing_ids) && thing_ids.length > 0) {
      const things = await prisma.thing.findMany({
        relationLoadStrategy: 'join', // or 'query'
        where: {
          thing_id: {
            in: thing_ids as string[], // we beforehand filter out non string values but TS is not recognizing it
          },
        },
      })

      mappedValues.forEach((value) => {
        if (value.valueType === 'Thing') {
          const thing = things.find(
            (thing) => thing.thing_id === value.valueAsThing_id
          )
          if (thing) {
            value.valueAsThing = thing
          }
        }
      })
    }

    const amountOfAnswers = values.reduce(
      (acc, value) => acc + value._count._all,
      0
    )

    return {
      amountOfAnswers,
      newestValueDate: newestValue?.updatedAt,
      values: mappedValues,
    }
  } catch (error: any) {
    console.error('ERROR_edgAlwkv', error)
  }

  return defaultReturn
}
