export function replaceLastWhitespaceWithNonBreaking(text: string) {
  text = text.replaceAll(/oder\s/g, 'oder&nbsp;')
  text = text.replaceAll(/und\s/g, 'und&nbsp;')
  const regex = /(.*(?<!\s))(\s)((?!\s)[^\s]*?$)/
  return text.replace(regex, `$1&nbsp;$3`)
}
