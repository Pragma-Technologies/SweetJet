import { useEffect, useLayoutEffect } from 'react'
import { ColorConstant, ThemeConfig } from '../types'
import { getThemeVarsStyle, toCssColorsVars } from '../utils'

const bodyThemeSelector = (themeName: string, colors: ColorConstant<string>) =>
  `body.${themeName} {${getThemeVarsStyle(toCssColorsVars(colors))}\n}\n`

export const useThemeLayoutEffect = <ThemeNames extends string, Colors extends string, ThemedIcons, ThemedImages>(
  themeName: ThemeNames,
  themeConfig: ThemeConfig<ThemeNames, Colors, ThemedIcons, ThemedImages>,
): void => {
  const themes = Object.keys(themeConfig)

  useEffect(() => {
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

    styles.innerHTML = `${themes.map((el) => bodyThemeSelector(el, themeConfig[el as ThemeNames].colors))}\n`

    document.body.classList.add(themeName)
  }, [])
}
