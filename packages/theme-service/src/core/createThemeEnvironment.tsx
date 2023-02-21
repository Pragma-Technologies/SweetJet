import { useStrictContext } from '@pragma-web-utils/hooks'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { useListenMediaQueryMatches, useThemeLayoutEffect } from '../hooks'
import { ColorConstant, CreateStrictEnvironmentOutput, ThemeContextProps, Themed, ThemeName } from '../types'

export function createThemeEnvironment<T, Colors extends string, ThemedIcons, ThemedImages>(
  context: React.Context<unknown | T>,
  contextName: string,
  mediaQueryList: MediaQueryList | undefined,
  lightColors: ColorConstant<Colors>,
  darkColors: ColorConstant<Colors>,
  iconsSets: Themed<ThemedIcons>,
  imagesSets: Themed<ThemedImages>,
): CreateStrictEnvironmentOutput<T> {
  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<ThemeContextProps> = ({ children, defaultTheme }) => {
    const [themeName, setThemeName] = useState<ThemeName>(
      () => defaultTheme ?? (mediaQueryList?.matches ? 'dark' : 'light') ?? 'light',
    )

    useListenMediaQueryMatches(mediaQueryList, setThemeName)

    useThemeLayoutEffect(themeName, lightColors, darkColors)

    useEffect(() => {
      const themes: ThemeName[] = ['dark', 'light']
      document.body.classList.remove(...themes)
      document.body.classList.add(themeName)
    }, [themeName])

    const toggleTheme = useCallback(() => setThemeName(themeName === 'dark' ? 'light' : 'dark'), [themeName])

    const icons = iconsSets[themeName]

    const images = imagesSets[themeName]

    return (
      <context.Provider
        value={{
          themeName,
          setTheme: setThemeName,
          toggleTheme,
          icons,
          images,
          colors: themeName === 'dark' ? darkColors : lightColors,
        }}
      >
        {children}
      </context.Provider>
    )
  }

  return { hook, wrapper }
}
