export function stringToHex(value: string): string {
  let result = ''
  for (const sym of value) {
    result += sym.charCodeAt(0).toString(16)
  }
  return result
}
