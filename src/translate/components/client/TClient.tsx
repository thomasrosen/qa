'use client'

import { TRANSLATION_DEFAULTS } from '@/lib/constants'
import { getRequestDataAsKey } from '@/translate/components/TranslationStore'
import { useTranslationStore } from '@/translate/components/client/TranslationStoreProvider'
import { getLocaleClient } from '@/translate/lib/getLocaleClient'
import { mapChildrenToTranslation } from '@/translate/lib/mapChildrenToTranslation'
import { reactToString } from '@/translate/lib/reactToString'
import { reactWrappedWithIds } from '@/translate/lib/reactWrappedWithIds'
import { useEffect, useMemo, type ReactNode } from 'react'

export function TClient({
  children,
  keys = [],
  ...options
}: {
  children?: ReactNode
  keys?: string[] | string
  [key: string]: any
}): ReactNode {
  const { requestData, requestDataAsKey } = useMemo(() => {
    const optionsWithDefaults: Record<string, any> = {
      ...TRANSLATION_DEFAULTS,
      ...options,
    }

    if (!optionsWithDefaults.locale) {
      optionsWithDefaults.locale = getLocaleClient()
    }

    if (typeof keys === 'string') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      keys = [keys].filter(Boolean)
    }

    const rawText = reactToString(children).replace(/\s+/g, ' ').trim()
    const textWithIds = reactWrappedWithIds(children)
      .replace(/\s+/g, ' ')
      .trim()
    const requestData = {
      text: {
        text: rawText,
        mapping: textWithIds,
      },
      keys,
      options: optionsWithDefaults,
    }
    const requestDataAsKey = getRequestDataAsKey(requestData)

    return {
      requestData,
      requestDataAsKey,
    }
  }, [children, keys, options])

  const translations = useTranslationStore((state) => state.translations)
  const requestTranslation = useTranslationStore(
    (state) => state.requestTranslation
  )

  useEffect(() => {
    async function run() {
      if (!translations[requestDataAsKey]) {
        requestTranslation(requestData)
      }
    }
    run()
  }, [
    children,
    options,
    requestData,
    requestDataAsKey,
    requestTranslation,
    translations,
  ])

  if (!children) {
    return null
  }

  if (translations[requestDataAsKey]) {
    const translation = translations[requestDataAsKey]
    const translatedChildren = mapChildrenToTranslation(
      translation.parts || {},
      children
    )
    return translatedChildren
  }

  return children
}

export const TC = TClient
