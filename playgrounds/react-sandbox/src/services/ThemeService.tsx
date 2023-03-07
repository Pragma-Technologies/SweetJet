import { createThemeEnvironment, ThemeConfig, ThemeContextType } from '@pragma-web-utils/theme-service'
import { FC, ReactNode } from 'react'

type ThemeName = 'main' | 'additional'
type Colors = 'primary' | 'secondary'
type UpliftThemeContext = ThemeContextType<ThemeName, Colors, undefined, undefined>

const themeConfig: ThemeConfig<ThemeName, Colors, undefined, undefined> = {
  main: { colors: { primary: '#fff', secondary: '#000' }, icons: undefined, images: undefined },
  additional: { colors: { primary: '#000', secondary: '#fff' }, icons: undefined, images: undefined },
}

const themeEnvironment = createThemeEnvironment<UpliftThemeContext, ThemeName, Colors, undefined, undefined>(
  'ThemeContext',
  themeConfig,
)

export const ThemeContextProvider = themeEnvironment.wrapper as FC<{ children?: ReactNode | undefined }>
export const useTheme = themeEnvironment.hook
