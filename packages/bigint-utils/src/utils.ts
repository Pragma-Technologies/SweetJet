export function checkDecimals(decimals: number): boolean {
  if (!(decimals >= 0 && decimals <= 256 && !(decimals % 1))) {
    throw new Error(`Invalid decimal size: ${decimals}`)
  }
  return true
}

export function checkZeroString(value: string): boolean {
  return /^(0)*$/.test(value)
}
