import { BI, BIish, BIParseOption } from './types'
import { checkDecimals, checkZeroString } from './utils'

// Constant to pull zeros from for multipliers
const ZEROS = new Array(256).fill('0').join('')

export function toDecimals(amount: BIish, decimals: number): string {
  checkDecimals(decimals)

  amount = fromBIish(amount)
  // if decimals equal 0 than amount is integer and no need add fraction part
  if (!decimals) {
    return amount.toString()
  }

  const multiplier = BigInt('1' + ZEROS.slice(0, decimals))

  const sign = amount < BigInt(0) ? BigInt(-1) : BigInt(1)
  const whole = (amount / multiplier).toString()
  let fraction = ((sign * amount) % multiplier).toString()

  // if fraction is zero, then return integer part
  if (checkZeroString(fraction)) {
    return whole
  }

  // Fully pad the string with zeros to get to wei
  if (fraction.length < decimals) {
    fraction = ZEROS.slice(0, decimals - fraction.length) + fraction
  }

  return `${whole}.${fraction}`.replace(/(0)+$/, '')
}

export const defaultOptions: BIParseOption = {
  isDecimalsCountOverflowPossible: true,
}
export function fromDecimals(amount: string, decimals: number, options?: Partial<BIParseOption>): BI {
  checkDecimals(decimals)

  amount = amount.trim()

  if (!amount.match(/^-?[0-9.]+$/)) {
    throw new Error(`Invalid decimal amount: ${amount}`)
  }

  if (!amount.match(/[0-9]+/)) {
    throw new Error(`Missing decimal amount: ${amount}}`)
  }

  const _options: BIParseOption = { ...defaultOptions, ...options }

  // Split it into a whole and fractional part
  let [whole, fraction, rest] = amount.split('.')
  if (rest !== undefined) {
    throw new Error(`Too many decimal points: ${amount}`)
  }

  whole = whole || '0'
  let passedFractions = fraction?.slice(0, decimals) ?? '0'

  // Check the fraction doesn't exceed our decimals size
  if (!_options.isDecimalsCountOverflowPossible && fraction && !checkZeroString(fraction.slice(decimals))) {
    throw new Error(`Fractional component exceeds decimals: ${fraction}`)
  }

  // Fully pad the string with zeros to get to wei
  if (passedFractions.length < decimals && !checkZeroString(passedFractions)) {
    passedFractions += ZEROS.slice(0, decimals - passedFractions.length)
  }

  return BigInt(whole + ZEROS.slice(0, decimals)) + BigInt(passedFractions)
}

export function fromBIish(amount: BIish): BI {
  return typeof amount === 'bigint' ? amount : BigInt(amount)
}

const precisionDictionary: Record<number, number> = {
  2: 100,
}
export function fromBP(percentInBP: BI, percentDecimals = 2): number {
  const onePercent =
    precisionDictionary[percentDecimals] ?? (precisionDictionary[percentDecimals] = 10 ** percentDecimals)
  return Number(percentInBP) / onePercent
}
