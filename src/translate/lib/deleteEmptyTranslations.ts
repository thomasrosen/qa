import { prisma } from '@/lib/prisma'
import { OriginalTextType, OutputOptionsType } from '@/translate/types'

export async function deleteEmptyTranslations({
  originalText,
  outputOptions,
}: {
  originalText: OriginalTextType
  outputOptions: OutputOptionsType
}) {
  return await prisma.translation.deleteMany({
    where: {
      originalText: {
        equals: originalText as any, // any cause matching json in prisma is hard
      },
      outputOptions: {
        equals: outputOptions as any,
      },
      translatedBy: '', // only remove empty translations
    },
  })
}
