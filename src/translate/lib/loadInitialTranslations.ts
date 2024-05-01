import 'server-only'

import {
  TranslationInputProps,
  TranslationOutputProps,
  TranslationState,
  TranslationStateTranslation,
  getRequestDataAsKey,
} from '@/translate/components/TranslationStore'
// import { loadTranslationsByKeys } from './loadTranslationsByKeys'

export async function loadInitialTranslations({
  keys = [],
}: {
  keys: string[] | string
}): Promise<TranslationState | undefined> {
  if (typeof keys === 'string') {
    keys = [keys]
  }

  keys = keys.map((key) => key.toLowerCase()).filter(Boolean)

  if (keys.length === 0) {
    return {
      translations: {},
    }
  }

  const translations: any[] = [] // await loadTranslationsByKeys({ keys })

  const translationsPerKey = translations.reduce(
    (acc: TranslationStateTranslation, translationRow) => {
      const requestData: TranslationInputProps = {
        text: translationRow.originalText as any,
        keys: translationRow.keys,
        options: translationRow.outputOptions as any,
      }
      const requestDataAsKey = getRequestDataAsKey(requestData)

      if (requestDataAsKey) {
        const translation = translationRow.translation as TranslationOutputProps
        acc[requestDataAsKey] = {
          text: translation?.text || '',
          parts: translation?.parts || {},
        }
      }
      return acc
    },
    {}
  )

  return {
    translations: translationsPerKey,
  }
}
