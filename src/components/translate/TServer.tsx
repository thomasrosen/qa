import 'server-only'

import { TRANSLATION_DEFAULTS } from '@/lib/constants'
import { getLocaleServer } from '@/lib/translate/getLocaleServer'
import { getTranslationWithParts } from '@/lib/translate/getTranslation'
import { mapChildrenToTranslation } from '@/lib/translate/mapChildrenToTranslation'
import { reactToString } from '@/lib/translate/reactToString'
import { reactWrappedWithIds } from '@/lib/translate/reactWrappedWithIds'
import React from 'react'

export async function tServer({
  text,
  ...options
}: {
  text?: string
  [key: string]: any
}): Promise<string | undefined> {
  if (!text) {
    return undefined
  }

  options = {
    ...TRANSLATION_DEFAULTS,
    ...options,
  }

  if (!options.locale) {
    options.locale = getLocaleServer()
  }

  const rawText = String(text).replaceAll(/\s+/g, ' ').trim()

  const translation = await getTranslationWithParts({
    text: rawText,
    options,
  })

  return translation.text
}

// @ts-expect-error
export async function TServer({
  children,
  ...options
}: {
  children?: React.ReactNode
  [key: string]: any
}): Promise<React.ReactNode> {
  if (!children || children === '' || typeof children === 'number') {
    return null
  }

  if (typeof children === 'string') {
    const translatedText = tServer({
      text: children,
      options,
    })
    return translatedText
  }

  options = {
    ...TRANSLATION_DEFAULTS,
    ...options,
  }

  if (!options.locale) {
    options.locale = getLocaleServer()
  }

  const rawText = reactToString(children).replaceAll(/\s+/g, ' ').trim()
  const textWithIds = reactWrappedWithIds(children)
    .replaceAll(/\s+/g, ' ')
    .trim()

  const translation = await getTranslationWithParts({
    text: {
      text: rawText,
      mapping: textWithIds,
    },
    options,
  })

  const translatedChildren = mapChildrenToTranslation(
    translation.parts || {},
    children
  )

  return translatedChildren
}

export const TS = TServer
