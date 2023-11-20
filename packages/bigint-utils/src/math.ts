import { BI } from './types'

export const BIMath = {
  min: (...values: BI[]): BI => {
    if (values.length < 2) {
      return values[0] ?? BigInt(0)
    }
    const value1 = values.pop() as BI
    const value2 = BIMath.min(...values)
    return value1 > value2 ? value2 : value1
  },
  max: (...values: BI[]): BI => {
    if (values.length < 2) {
      return values[0] ?? BigInt(0)
    }
    const value1 = values.pop() as BI
    const value2 = BIMath.max(...values)
    return value1 < value2 ? value2 : value1
  },
}
