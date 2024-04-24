import 'server-only'

import { TRANSLATION_DEFAULTS } from '@/lib/constants'
import { getLocaleServer } from '@/translate/lib/getLocaleServer'
import { getTranslationWithParts } from '@/translate/lib/getTranslationWithParts'
import { mapChildrenToTranslation } from '@/translate/lib/mapChildrenToTranslation'
import { reactToString } from '@/translate/lib/reactToString'
import { reactWrappedWithIds } from '@/translate/lib/reactWrappedWithIds'
import React from 'react'

export async function tServer({
  text,
  keys = [],
  ...options
}: {
  text?: string
  keys?: string[] | string
  [key: string]: any
}): Promise<string | undefined> {
  if (!text) {
    return undefined
  }

  if (typeof keys === 'string') {
    keys = [keys].filter(Boolean)
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
    keys,
    options,
  })

  if (translation.text === '') {
    return text
  }

  return translation.text
}

// @ts-expect-error
export async function TServer({
  children,
  keys = [],
  ...options
}: {
  children?: React.ReactNode
  keys?: string[] | string
  [key: string]: any
}): Promise<React.ReactNode> {
  if (!children || children === '' || typeof children === 'number') {
    return null
  }

  if (typeof keys === 'string') {
    keys = [keys].filter(Boolean)
  }

  if (typeof children === 'string') {
    const translatedText = tServer({
      text: children,
      keys,
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
    keys,
    options,
  })

  if (translation.text === '') {
    return children
  }

  const translatedChildren = mapChildrenToTranslation(
    translation.parts || {},
    children
  )

  return translatedChildren
}

export const TS = TServer
