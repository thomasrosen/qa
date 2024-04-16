export function getContrastTextColor(hexBgColor: string) {
  // source: https://www.perplexity.ai/search/js-function-to-j8tPVzTZQq2rxca11yCUbg
  // more info: https://stackoverflow.com/a/3943023/206879

  // Convert hex to RGB
  let r = parseInt(hexBgColor.substring(1, 3), 16)
  let g = parseInt(hexBgColor.substring(3, 5), 16)
  let b = parseInt(hexBgColor.substring(5, 7), 16)

  // Calculate the perceptive luminance
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black or white depending on the luminance
  return luminance > 0.179 ? '#000000' : '#FFFFFF'
}
