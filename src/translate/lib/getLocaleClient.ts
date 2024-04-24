import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { match } from '@formatjs/intl-localematcher'
import ExecutionEnvironment from 'exenv'

export function getLocaleClient() {
  if (ExecutionEnvironment.canUseDOM) {
    const matchedLocale = match(navigator.languages, LOCALES, DEFAULT_LOCALE)
    return matchedLocale
  }
  return DEFAULT_LOCALE
}
