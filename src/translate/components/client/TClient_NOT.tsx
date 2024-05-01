'use client'

import { translate } from '@/actions/translate'
import { TRANSLATION_DEFAULTS } from '@/lib/constants'
import { getLocaleClient } from '@/translate/lib/getLocaleClient'
import { mapChildrenToTranslation } from '@/translate/lib/mapChildrenToTranslation'
import { reactToString } from '@/translate/lib/reactToString'
import { reactWrappedWithIds } from '@/translate/lib/reactWrappedWithIds'
import { useEffect, useState, type ReactNode } from 'react'

export function TClient_NOT({
  children,
  ...options
}: {
  children?: ReactNode
  [key: string]: any
}): ReactNode {
  const [translatedChildren, setTranslatedChildren] =
    useState<ReactNode | null>(null)

  useEffect(() => {
    async function run() {
      const optionsWithDefaults: Record<string, any> = {
        ...TRANSLATION_DEFAULTS,
        ...options,
      }

      if (!optionsWithDefaults.locale) {
        optionsWithDefaults.locale = getLocaleClient()
      }

      const rawText = reactToString(children).replace(/\s+/g, ' ').trim()
      const textWithIds = reactWrappedWithIds(children)
        .replace(/\s+/g, ' ')
        .trim()

      const translation = await translate({
        text: {
          text: rawText,
          mapping: textWithIds,
        },
        options: optionsWithDefaults,
      })

      const newTranslatedChildren = mapChildrenToTranslation(
        translation.parts || {},
        children
      )
      setTranslatedChildren(newTranslatedChildren)
    }
    run()
  }, [children, options])

  if (!children) {
    return null
  }

  if (!translatedChildren) {
    return children
  }

  return translatedChildren
}

export const TC_NOT = TClient_NOT
