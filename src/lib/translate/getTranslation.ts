import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type OutputOptionsType = Record<string, any>
// {
//   locale: string // en / en-US / en-GB / de / de-CH / fr-CH / ...
//   formality?: string // 'formal' | 'informal'
//   glossary?: string // "in german is identifier = 'Identifikator'"
//   ...
// }

async function translateReactWithOpenAi(
  text: string, // { text: 'ABC DEF', mapping: '<1>ABC</1> <1>DEF</1>' }
  outputOptions: OutputOptionsType
) {
  const prompt = `Translate the text from the user. Use these output options: ${JSON.stringify(
    outputOptions
  )}
The locale is an IETF language tag. THE LANGUAGE IS MORE IMPORTANT THAN THE REGION.
THE TRANSLATION MUST CONFORM TO ALL THE OUTPUT OPTIONS.
Use fitting short forms.
You get the raw text and the mapping of the text parts to ids.
Respond in this json structure: { text: "full translated text", parts: { 01: "translated part with whitespace", 02: "translated part with whitespace", … } } Be precise with the part ids.
Any letter from the full translation must be in the parts.
Leave the parts empty if no mapping was provided.
DO NOT REMOVE INFORMATION WHEN TRANSLATING.`

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      { role: 'user', content: text },
    ],
    model: 'gpt-4-turbo',
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
    return JSON.parse(responseMessageContent)
  } catch (error) {
    throw new Error('Could not parse responseMessageContent')
  }
}

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

async function saveTranslation({
  originalText,
  translation,
  outputOptions,
  translatedBy,
}: {
  originalText: string
  translation: any // { text: '', parts: {} }
  outputOptions: OutputOptionsType
  translatedBy: string
}) {
  const existingTranslationRow = await prisma.translation.findFirst({
    where: {
      originalText,
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
      },
    })
  }
}

async function deleteEmptyTranslations({
  originalText,
  outputOptions,
}: {
  originalText: string
  outputOptions: OutputOptionsType
}) {
  return await prisma.translation.deleteMany({
    where: {
      originalText,
      outputOptions: {
        equals: outputOptions as any,
      },
      translatedBy: '', // only remove empty translations
    },
  })
}

export async function getTranslationWithParts({
  text,
  options,
}: {
  text: string | Record<string, any>
  options: OutputOptionsType
}): Promise<{
  text: string
  parts: Record<string, string>
}> {
  if (!text || text === '') {
    return {
      text: '',
      parts: {},
    }
  }

  if (typeof text !== 'string') {
    text = JSON.stringify(text)
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
      originalText: text,
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
    },
  })

  if (!translationRow) {
    ;(async () => {
      try {
        saveTranslation({
          originalText: text,
          translation: { text: '', parts: {} },
          outputOptions: outputOptionsAsKey,
          translatedBy: '',
        })

        console.info('Getting new translation...')
        const newTranslation = await translateReactWithOpenAi(
          text,
          outputOptions
        )

        await saveTranslation({
          originalText: text,
          translation: newTranslation,
          outputOptions: outputOptionsAsKey,
          translatedBy: 'OpenAI',
        })
        console.info('Saved new translation.')
        await deleteEmptyTranslations({
          originalText: text,
          outputOptions: outputOptionsAsKey,
        })
        console.info('Deleted empty duplicates.')
      } catch (error) {
        console.error('ERROR_HNC9ly5W', error)
      }
    })()

    return {
      text,
      parts: {},
    }
  }

  const firstTranslation = translationRow.translation
  return firstTranslation as any
}

export async function getTranslation(props: any) {
  const translation = await getTranslationWithParts(props)
  if (!translation) {
    return ''
  }
  if (!translation.text) {
    return ''
  }
  return translation.text
}
