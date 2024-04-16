export function getJsonLdValueAsString(jsonld: any, key: string): string {
  if (
    typeof jsonld === 'object' &&
    jsonld !== null &&
    !Array.isArray(jsonld) &&
    jsonld[key]
  ) {
    return String(jsonld[key])
  }
  return ''
}
