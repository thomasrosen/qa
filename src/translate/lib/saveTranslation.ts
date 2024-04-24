import { prisma } from '@/lib/prisma'
import { OriginalTextType, OutputOptionsType } from '@/translate/types'

export async function saveTranslation({
  originalText,
  outputOptions,
  translation,
  translatedBy,
  keys = [],
}: {
  originalText: OriginalTextType
  outputOptions: OutputOptionsType
  translation: any // { text: '', parts: {} }
  translatedBy: string
  keys?: string[]
}) {
  const existingTranslationRow = await prisma.translation.findFirst({
    where: {
      originalText: {
        equals: originalText as any, // any cause matching json in prisma is hard
      },
      outputOptions: {
        equals: outputOptions as any,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      translation_id: true,
    },
  })

  if (existingTranslationRow) {
    // update
    return await prisma.translation.update({
      where: {
        translation_id: existingTranslationRow.translation_id,
      },
      data: {
        translation,
        translatedBy,
        keys,
      },
    })
  } else {
    // create
    return await prisma.translation.create({
      data: {
        originalText,
        translation,
        outputOptions: outputOptions as any,
        translatedBy,
        keys,
      },
    })
  }
}
