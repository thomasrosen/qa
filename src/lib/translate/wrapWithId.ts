export const wrapWithId = (
  element: React.ReactNode,
  key: string = '0'
): string => {
  return `<${key}>${element}</${key}>`
}
