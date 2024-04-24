'use server'

import { getTranslationWithParts } from '@/translate/lib/getTranslationWithParts'

export async function translate(props: any) {
  return await getTranslationWithParts(props)
}
