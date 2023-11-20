import { BIish } from './types'
import { toDecimals } from './convert'

export function formattedDecimals(
  amountTKN: BIish,
  decimals: number,
  formatOptions?: Intl.NumberFormatOptions,
): string {
  const units = toDecimals(amountTKN, decimals)
  return formattedNumber(+units, formatOptions)
}

export function formattedNumber(value: number, formatOptions?: Intl.NumberFormatOptions): string {
  // TODO: use translation language instead of navigator languages
  return new Intl.NumberFormat('en', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...formatOptions,
  }).format(value)
}
