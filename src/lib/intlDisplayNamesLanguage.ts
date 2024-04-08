export function intlDisplayNamesLanguage(in_locale: string, of_locale: string) {
  try {
    return new Intl.DisplayNames([in_locale], { type: 'language' }).of(
      of_locale
    )
  } catch (error) {
    // silently fail as in_locale or of_locale might just not be supported. fallback to of_locale
  }

  return of_locale // fallback
}
