import { prisma } from '@/lib/prisma'
import { addKeysToTranslation } from '@/translate/lib/addKeysToTranslation'
import { deleteEmptyTranslations } from '@/translate/lib/deleteEmptyTranslations'
import { saveTranslation } from '@/translate/lib/saveTranslation'
import { OriginalTextType, OutputOptionsType } from '@/translate/types'
import { translateReactWithOpenAi } from './translateReactWithOpenAi'

// {
//   locale: string // en / en-US / en-GB / de / de-CH / fr-CH / ...
//   formality?: string // 'formal' | 'informal'
//   glossary?: string // "in german is identifier = 'Identifikator'"
//   ...
// }

/*
async function translateWithOpenAi(
  text: string,
  outputOptions: OutputOptionsType
) {
  const prompt = `Translate the text from the user. Use these output options: ${JSON.stringify(
    outputOptions
  )}
Respond in this json structure: { text: "translated text" }`

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      { role: 'user', content: JSON.stringify({ text }) },
    ],
    model: 'gpt-3.5-turbo',
    response_format: { type: 'json_object' },
  })

  if (!chatCompletion) {
    throw new Error('No chatCompletion')
  }

  if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
    throw new Error('No chatCompletion.choices')
  }

  const firstChoice = chatCompletion.choices[0]
  const responseMessageContent = firstChoice.message.content

  if (!responseMessageContent || responseMessageContent === '') {
    throw new Error('No responseMessageContent')
  }

  try {
    const { text: translatedText } = JSON.parse(responseMessageContent)
    return translatedText
  } catch (error) {
    throw new Error('Could not parse responseMessageContent')
  }
}
*/

export async function getTranslationWithParts({
  text: originalText,
  keys = [],
  options,
}: {
  text: OriginalTextType
  keys?: string[]
  options: OutputOptionsType
}): Promise<{
  text: string
  parts: Record<string, string>
}> {
  keys = keys.map((key) => key.toLowerCase())

  if (!originalText || originalText === '') {
    return {
      text: '',
      parts: {},
    }
  }

  const defaultOptions: OutputOptionsType = {
    locale: 'en-GB',
    formality: 'formal',
  }

  const outputOptions = { ...defaultOptions, ...options }

  const outputOptionsAsKey = {
    // only use these as the key, to not have too many different keys
    locale: outputOptions.locale,
    formality: outputOptions.formality,
  }

  const translationRow = await prisma.translation.findFirst({
    where: {
      originalText: {
        equals: originalText as any, // any cause matching json in prisma is hard
      },
      outputOptions: {
        equals: outputOptionsAsKey as any,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      translation: true,
      translatedBy: true,
      keys: true,
    },
  })

  const sortedKeys = keys.sort((a, b) => a.localeCompare(b))

  if (!translationRow) {
    ;(async () => {
      try {
        saveTranslation({
          originalText,
          translation: { text: '', parts: {} },
          outputOptions: outputOptionsAsKey,
          translatedBy: '',
          keys: [],
        })

        if (process.env.NODE_ENV === 'development') {
          console.info('INFO_WIPlPMiN', 'Getting new translation...')
        }
        const textAsString = JSON.stringify(
          typeof originalText === 'string'
            ? { text: originalText }
            : originalText
        )
        const newTranslation = await translateReactWithOpenAi(
          textAsString,
          outputOptions
        )

        await saveTranslation({
          originalText,
          translation: newTranslation,
          outputOptions: outputOptionsAsKey,
          translatedBy: 'OpenAI',
          keys,
        })
        if (process.env.NODE_ENV === 'development') {
          console.info('INFO_Fi3J3OFQ', 'Saved new translation.')
        }
        await deleteEmptyTranslations({
          originalText,
          outputOptions: outputOptionsAsKey,
        })
        if (process.env.NODE_ENV === 'development') {
          console.info('INFO_kqVjJ8dn', 'Deleted empty duplicates.')
        }
      } catch (error) {
        console.error('ERROR_HNC9ly5W', error)
      }
    })()

    return {
      text: '',
      parts: {},
    }
  } else {
    const translationRowKeys = (translationRow.keys || []).sort((a, b) =>
      a.localeCompare(b)
    )
    if (JSON.stringify(sortedKeys) !== JSON.stringify(translationRowKeys)) {
      // updated keys if different
      ;(async () => {
        await addKeysToTranslation({
          originalText,
          outputOptions: outputOptionsAsKey,
          keys,
        })
      })()
    }
  }

  const firstTranslation = translationRow.translation
  return firstTranslation as any
}

// export async function getTranslation(props: any) {
//   const translation = await getTranslationWithParts(props)
//   if (!translation) {
//     return ''
//   }
//   if (!translation.text) {
//     return ''
//   }
//   return translation.text
// }
