'use client'

import { TRANSLATION_DEFAULTS } from '@/lib/constants'
import { getRequestDataAsKey } from '@/translate/components/TranslationStore'
import { useTranslationStore } from '@/translate/components/client/TranslationStoreProvider'
import { getLocaleClient } from '@/translate/lib/getLocaleClient'
import { useCallback } from 'react'

export function useTranslation() {
  const translations = useTranslationStore((state) => state.translations)

  const translationsAsJson = JSON.stringify(translations)

  const t = useCallback(
    (
      text: string,
      props?:
        | {
            keys?: string[] | string
            [key: string]: any
          }
        | undefined
    ): string | undefined => {
      if (!text) {
        return undefined
      }

      let { keys = [], ...options } = props || {}

      if (typeof keys === 'string') {
        keys = [keys].filter(Boolean)
      }

      const optionsWithDefaults: Record<string, any> = {
        ...TRANSLATION_DEFAULTS,
        ...options,
      }

      if (!optionsWithDefaults.locale) {
        optionsWithDefaults.locale = getLocaleClient()
      }

      const rawText = String(text).replaceAll(/\s+/g, ' ').trim()

      const requestData = {
        text: rawText,
        keys,
        options: optionsWithDefaults,
      }
      const requestDataAsKey = getRequestDataAsKey(requestData)

      const parsedTranslations = JSON.parse(translationsAsJson)

      if (!parsedTranslations[requestDataAsKey]) {
        // ;(async () => {
        //   try {
        //     const result = await translate(requestData) // call server action to trigger update. the updated translation is only available after the component reloaded.
        //   } catch (error: any) {}
        // })()
        return text
      }

      return parsedTranslations[requestDataAsKey].text
    },
    [translationsAsJson]
  )

  return t
}
