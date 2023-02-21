import { FunctionComponent, SVGProps } from 'react'

export type CssColorVarKeys<T extends string> = `--${T}`
export type CssColorVarValues<T extends string> = `var(--${T})`

export type ColorConstant<T extends string> = { [key in T]: string }
export type CssColorVars<T extends string> = { [key in CssColorVarKeys<T>]: string }
export type CssColorConstant<T extends string> = { [key in T]: CssColorVarValues<key> }

export type ThemeName = 'light' | 'dark'
export type Themed<T> = { [key in ThemeName]: T }

export interface ThemeContextProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
}

export type svgType = FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined }>

export interface ThemeContextType<Colors extends string, ThemedIcons, ThemedImages> {
  themeName: ThemeName

  setTheme(themeName: ThemeName): void

  toggleTheme(): void

  icons: ThemedIcons

  images: ThemedImages

  colors: ColorConstant<Colors>
}
