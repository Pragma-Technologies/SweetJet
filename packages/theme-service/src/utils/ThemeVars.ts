import { ColorConstant, CssColorVars } from '../types'

export function toCssColorsVars<T extends string>(colors: ColorConstant<T>): CssColorVars<T> {
  const entries = Object.entries(colors) as [T, string][]
  return entries.reduce((curr: Partial<CssColorVars<T>>, [key, value]) => {
    curr[`--${key}`] = value
    return curr
  }, {}) as CssColorVars<T>
}

export function getThemeVarsStyle<T extends string>(colors: CssColorVars<T>): string {
  return Object.entries(colors).reduce((curr: string, [key, value]) => `${curr}\n  ${key}: ${value};`, '')
}
