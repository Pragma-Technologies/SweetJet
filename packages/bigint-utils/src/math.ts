import { BI } from './types'

export function getMinBN(...values: BI[]): BI {
  if (values.length < 2) {
    return values[0] ?? BigInt(0)
  }
  const value1 = values.pop() as BI
  const value2 = getMinBN(...values)
  return value1 > value2 ? value2 : value1
}

export function getMaxBN(...values: BI[]): BI {
  if (values.length < 2) {
    return values[0] ?? BigInt(0)
  }
  const value1 = values.pop() as BI
  const value2 = getMaxBN(...values)
  return value1 < value2 ? value2 : value1
}
