import { prisma } from '@/lib/prisma'
import { OriginalTextType, OutputOptionsType } from '@/translate/types'

export async function addKeysToTranslation({
  originalText,
  outputOptions,
  keys = [],
}: {
  originalText: OriginalTextType
  outputOptions: OutputOptionsType
  keys?: string[]
}) {
  // add newly found keys to the translation.
  // delete the entry in the database, or empty the keys-field in the DB, to remove unnecessary keys.

  const existingTranslationRow = await prisma.translation.findFirst({
    where: {
      originalText: {
        equals: originalText as any, // any cause matching json in prisma is hard
      },
      outputOptions: {
        equals: outputOptions as any, // any cause matching json in prisma is hard
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      translation_id: true,
      keys: true,
    },
  })

  if (existingTranslationRow) {
    const newKeys = [
      ...new Set([
        // make sure to have every key only once
        ...keys, // add new keys
        ...(existingTranslationRow.keys || []), // add existing keys
      ]),
    ].sort((a, b) => a.localeCompare(b)) // sort alphabetically

    return await prisma.translation.update({
      where: {
        translation_id: existingTranslationRow.translation_id,
      },
      data: {
        keys: newKeys,
      },
    })
  }

  // don't update if not already existing
}
