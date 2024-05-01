export function getFirstValue(value: any[] | undefined) {
  if (!value || value.length === 0 || !Array.isArray(value)) {
    return undefined
  }
  return value[0]
}
