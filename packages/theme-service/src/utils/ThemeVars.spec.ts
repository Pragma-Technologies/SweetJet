import { getThemeVarsStyle, toCssColorsVars } from '../utils'

describe('Theme vars utils', () => {
  const colors = {
    black_0_0_0: 'rgb(0, 0, 0)',
    black_34_34_30: 'rgb(34, 34, 30)',
    blue_39_117_202: 'rgb(39, 117, 202)',
    blue_98_126_234: 'rgb(98, 126, 234)',
  }

  const colorVars = {
    '--black_0_0_0': 'rgb(0, 0, 0)',
    '--black_34_34_30': 'rgb(34, 34, 30)',
    '--blue_39_117_202': 'rgb(39, 117, 202)',
    '--blue_98_126_234': 'rgb(98, 126, 234)',
  }

  const styleVars = `
  --black_0_0_0: rgb(0, 0, 0);
  --black_34_34_30: rgb(34, 34, 30);
  --blue_39_117_202: rgb(39, 117, 202);
  --blue_98_126_234: rgb(98, 126, 234);`

  it('toCssColorsVars', () => {
    expect(toCssColorsVars(colors)).toStrictEqual(colorVars)
  })

  it('getThemeVarsStyle', () => {
    expect(getThemeVarsStyle(colorVars)).toBe(styleVars)
  })

  it('getThemeVarsStyle(toCssColorsVars)', () => {
    expect(getThemeVarsStyle(toCssColorsVars(colors))).toBe(styleVars)
  })
})
