import 'server-only'

import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { headers } from 'next/headers'

export function getLocaleServer() {
  const headersList = headers()
  const acceptLanguage = headersList.get('accept-language')
  const languages = new Negotiator({
    headers: {
      'accept-language': acceptLanguage || '',
    },
  }).languages()

  const matchedLocale = match(languages, LOCALES, DEFAULT_LOCALE)
  return matchedLocale
}
