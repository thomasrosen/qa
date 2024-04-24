import { prisma } from '@/lib/prisma'

export async function loadTranslationsByKeys({
  keys = [],
}: {
  keys: string[]
}) {
  keys = keys.map((key) => key.toLowerCase())

  const translations = await prisma.translation.findMany({
    where: {
      keys: {
        hasSome: keys,
      },
    },
  })

  return translations
}
