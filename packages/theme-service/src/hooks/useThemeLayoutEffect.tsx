import { useEffect, useLayoutEffect } from 'react'
import { ColorConstant, ThemeName } from '../types'
import { getThemeVarsStyle, toCssColorsVars } from '../utils'

const bodyThemeSelector = (themeName: ThemeName, colors: ColorConstant<string>) =>
  `body.${themeName} {${getThemeVarsStyle(toCssColorsVars(colors))}\n}\n`

export const useThemeLayoutEffect = (
  themeName: ThemeName,
  lightColors: ColorConstant<string>,
  darkColors: ColorConstant<string>,
): void => {
  useEffect(() => {
    const themes: ThemeName[] = ['dark', 'light']
    document.body.classList.remove(...themes)
    document.body.classList.add(themeName)
  }, [themeName])

  return useLayoutEffect(() => {
    const themeStylesId = 'themeStyles'
    let styles = document.getElementById(themeStylesId)
    if (!styles) {
      styles = document.createElement('style')
      styles.id = themeStylesId
      document.head.appendChild(styles)
    }
    styles.innerHTML = `
    ${bodyThemeSelector('light', lightColors)}
    ${bodyThemeSelector('dark', darkColors)}`
    document.body.classList.add(themeName)
  }, [])
}
