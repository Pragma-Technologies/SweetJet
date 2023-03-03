import { useStrictContext } from '@pragma-web-utils/hooks'
import React, { FC, useState } from 'react'
import { useThemeLayoutEffect } from '../hooks'
import { CreateStrictEnvironmentOutput, ThemeConfig, ThemeContextProps } from '../types'

export function createThemeEnvironment<
  T,
  ThemeNames extends string,
  Colors extends string,
  ThemedIcons extends Record<string, unknown> | undefined,
  ThemedImages extends Record<string, unknown> | undefined,
>(
  contextName: string,
  themeConfig: ThemeConfig<ThemeNames, Colors, ThemedIcons, ThemedImages>,
): CreateStrictEnvironmentOutput<T, ThemeNames> {
  const context = React.createContext<unknown>(undefined)

  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<ThemeContextProps<ThemeNames>> = ({ children, defaultTheme }) => {
    const themes = Object.keys(themeConfig) as ThemeNames[]

    const [themeName, setThemeName] = useState<ThemeNames>(() => defaultTheme ?? themes[0])

    useThemeLayoutEffect(themeName, themeConfig)

    return <context.Provider value={{ themeName, setTheme: setThemeName, themeConfig }}>{children}</context.Provider>
  }

  return { hook, wrapper }
}
